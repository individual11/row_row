import { useState, useCallback, useRef } from 'react';

export interface RowMetrics {
  spm: number;
  distance: number;
  time: number; // in seconds
  watts: number;
  resistance: number;
}

export function useBluetooth() {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<RowMetrics>({
    spm: 0,
    distance: 0,
    time: 0,
    watts: 0,
    resistance: 0,
  });
  const [logs, setLogs] = useState<string[]>([]);
  // Use any for Bluetooth device types before @types/web-bluetooth fully kicks in
  const deviceRef = useRef<any>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg].slice(-20)); // keep last 20 logs
    console.log("[BT]", msg);
  };

  const connect = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not available in this browser.");
      }

      addLog("Requesting Bluetooth Device...");
      // We accept all devices for maximum discovery potential on the first run
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '00001826-0000-1000-8000-00805f9b34fb', // Standard FTMS
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Info Service
          '0000fe59-0000-1000-8000-00805f9b34fb', // FE59 Service
          '0bf669f0-45f2-11e7-9598-0800200c9a66', // Echelon Proprietary Base UUID 1
          '0bf669f1-45f2-11e7-9598-0800200c9a66', // Echelon Proprietary Base UUID 2
        ]
      });

      deviceRef.current = device;
      addLog(`Connecting to GATT Server on ${device.name}...`);
      
      // Attempt to read the advertised UUIDs (if any) before the security filter crushes the services list
      if (device.uuids && device.uuids.length > 0) {
        addLog(`Advertised UUIDs: ${device.uuids.join(', ')}`);
      } else {
        addLog(`No advertised UUIDs detected by Chrome.`);
      }
      
      const server = await device.gatt.connect();
      setIsConnected(true);
      addLog("Connected to GATT Server!");

      // Discovery Phase
      const services = await server.getPrimaryServices();
      addLog(`Found ${services.length} services.`);
      
      for (const service of services) {
        addLog(`Service: ${service.uuid}`);
        try {
          const characteristics = await service.getCharacteristics();
          
          for (const characteristic of characteristics) {
            addLog(`  Char: ${characteristic.uuid}`);
            if (characteristic.properties.notify || characteristic.properties.indicate) {
              try {
                await characteristic.startNotifications();
                characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
                  const value = event.target.value;
                  // Log raw bytes so we can reverse engineer the metrics
                  const bytes = new Uint8Array(value.buffer);
                  addLog(`[${characteristic.uuid}] Data: ${bytes.join(",")}`);
                  
                  // TODO: Reverse engineer the byte stream to extract:
                  // SPM, Distance, Time, Watts, Resistance
                });
                addLog(`    -> Subscribed to ${characteristic.uuid}`);
              } catch (err: any) {
                addLog(`    -> Failed to subscribe: ${err.message}`);
              }
            }
          }
        } catch (err: any) {
          addLog(`Could not get characteristics for ${service.uuid}`);
        }
      }

      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        addLog("Device disconnected");
      });

    } catch (error: any) {
      addLog(`Connection Error: ${error.message}`);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (deviceRef.current && deviceRef.current.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
  }, []);

  return { isConnected, connect, disconnect, metrics, logs };
}

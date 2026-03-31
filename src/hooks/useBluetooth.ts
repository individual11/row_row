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
                
                // Keep buffer across chunks
                let packetBuffer: number[] = [];

                characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
                  const bytes = Array.from(new Uint8Array(event.target.value.buffer));
                  
                  for (let i = 0; i < bytes.length; i++) {
                    const b = bytes[i] as number;
                    
                    if (packetBuffer.length === 0) {
                      if (b === 240) packetBuffer.push(b);
                    } else {
                      packetBuffer.push(b);
                      
                      if (packetBuffer.length >= 3) {
                        const expectedLength = packetBuffer[2] + 4; // Header(1) + Cmd(1) + Len(1) + Body(Len) + Checksum(1)
                        if (packetBuffer.length === expectedLength) {
                          // Verify Checksum
                          let sum = 0;
                          for (let j = 0; j < packetBuffer.length - 1; j++) {
                            sum += packetBuffer[j];
                          }
                          const checksum = sum % 256;
                          const actualChecksum = packetBuffer[packetBuffer.length - 1];

                          if (checksum === actualChecksum) {
                            const cmd = packetBuffer[1];
                            const body = packetBuffer.slice(3, packetBuffer.length - 1);
                            
                            // Guessing mappings based on observed values
                            if (cmd === 211) { // 0xD3 - Likely SPM! Value jumped 30, 39, 43
                              const spmValue = body[0];
                              setMetrics(prev => ({ ...prev, spm: spmValue }));
                              addLog(`[Decoded] SPM Updated: ${spmValue}`);
                            } else if (cmd === 209) { // 0xD1 - 17 Byte core metric payload!
                              addLog(`[Payload] ${body.join(", ")}`);
                              
                              // TODO: Figure out which indexes equal Distance, Watts, Time, Level
                              // Just picking arbitrary ones to see if the UI updates for the user to test
                              // Assuming index 2 is Time or Strokes based on incrementing 1, 2...
                              setMetrics(prev => ({ 
                                ...prev, 
                                time: body[2] || prev.time 
                              }));
                            } else {
                              addLog(`[Cmd ${cmd}] Body: ${body.join(", ")}`);
                            }
                          } else {
                            addLog(`[Error] Bad Checksum! Expected ${checksum}, got ${actualChecksum}`);
                          }
                          
                          // Reset buffer for the next valid 240 start byte
                          packetBuffer = [];
                        }
                      }
                    }
                  }
                });
                addLog(`    -> Subscribed! Listening for streams.`);
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

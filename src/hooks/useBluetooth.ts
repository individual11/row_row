import { useState, useCallback, useRef, useEffect } from 'react';

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
  const deviceRef = useRef<any>(null);
  const [permittedDevices, setPermittedDevices] = useState<any[]>([]);

  useEffect(() => {
    // Check for previously permitted devices to enable one-click reconnecting
    if (typeof navigator !== 'undefined' && navigator.bluetooth && (navigator.bluetooth as any).getDevices) {
      (navigator.bluetooth as any).getDevices().then((devices: any[]) => {
        setPermittedDevices(devices);
      }).catch(() => {});
    }
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg].slice(-20)); // keep last 20 logs
    console.log("[BT]", msg);
  };

  const setupDevice = async (device: any) => {
    try {
      deviceRef.current = device;
      addLog(`Connecting to GATT Server on ${device.name || 'Unknown Device'}...`);
      
      if (device.uuids && device.uuids.length > 0) {
        addLog(`Advertised UUIDs: ${device.uuids.join(', ')}`);
      } else {
        addLog(`No advertised UUIDs detected by Chrome.`);
      }
      
      const server = await device.gatt.connect();
      setIsConnected(true);
      addLog("Connected to GATT Server!");

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
                        const expectedLength = packetBuffer[2] + 4; 
                        if (packetBuffer.length === expectedLength) {
                          let sum = 0;
                          for (let j = 0; j < packetBuffer.length - 1; j++) {
                            sum += packetBuffer[j];
                          }
                          const checksum = sum % 256;
                          const actualChecksum = packetBuffer[packetBuffer.length - 1];

                          if (checksum === actualChecksum) {
                            const cmd = packetBuffer[1];
                            const body = packetBuffer.slice(3, packetBuffer.length - 1);
                            
                            if (cmd === 211) { 
                              const spmValue = body[0];
                              setMetrics(prev => ({ ...prev, spm: spmValue }));
                            } else if (cmd === 209) { 
                              addLog(`[Payload] ${body.join(", ")}`);
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
  };

  const connect = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not available in this browser.");
      }

      addLog("Requesting Bluetooth Device...");
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

      await setupDevice(device);
      
      // Update permitted list
      if ((navigator.bluetooth as any).getDevices) {
        const devices = await (navigator.bluetooth as any).getDevices();
        setPermittedDevices(devices);
      }
    } catch (error: any) {
      addLog(`Pairing Error: ${error.message}`);
      setIsConnected(false);
    }
  }, []);

  const reconnect = useCallback(async (device: any) => {
    try {
      addLog(`Attempting to reconnect to ${device.name || 'known device'}...`);
      await setupDevice(device);
    } catch (error: any) {
      addLog(`Reconnect Error: ${error.message}`);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (deviceRef.current && deviceRef.current.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
  }, []);

  return { isConnected, connect, reconnect, permittedDevices, disconnect, metrics, logs };
}

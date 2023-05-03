from pymodbus.client import ModbusTcpClient
import websocket
import json

# Define the modbus address and port
MODBUS_ADDRESS = '192.168.1.1'
MODBUS_PORT = 502

# Connect to the modbus device
client = ModbusTcpClient(MODBUS_ADDRESS, port=MODBUS_PORT)

# Read the modbus data
result = client.read_input_registers(0, 6)

# Create a WebSocket message
message = {
  'type': 'data',
  'data': list(result.registers)
}

# Send the WebSocket message to the server
websocket.create_connection('ws://localhost:3000').send(json.dumps(message))

# Close the modbus connection
client.close()
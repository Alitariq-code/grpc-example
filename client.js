const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const readline = require('readline');

const packageDefinition = protoLoader.loadSync('streaming.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const streamingProto = grpc.loadPackageDefinition(packageDefinition).BiDirectionalStreamer;

function main() {
  const client = new streamingProto('localhost:50051', grpc.credentials.createInsecure());

  const call = client.StreamLines();

  call.on('data', (lineMessage) => {
    console.log('Received from server:', lineMessage.line);
  });

  call.on('end', () => {
    console.log('Stream ended.');
  });

  const fileStream = fs.createReadStream('input.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    call.write({ line: line });
  });

  rl.on('close', () => {
    call.end();
  });
}

main();

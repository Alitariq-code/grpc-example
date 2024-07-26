const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('streaming.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const streamingProto = grpc.loadPackageDefinition(packageDefinition).BiDirectionalStreamer;

function streamLines(call) {
  call.on('data', (lineMessage) => {
    console.log('Received from client:', lineMessage.line);
    call.write({ line: `Server received: ${lineMessage.line}` });
  });

  call.on('end', () => {
    call.end();
  });
}

function main() {
  const server = new grpc.Server();
  server.addService(streamingProto.service, { StreamLines: streamLines });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('Server started on port 50051');
  });
}

main();

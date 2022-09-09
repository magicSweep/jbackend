export const checkMaxFileSizeOnStream = (props: {
  readStream: any;
  maxFileSizeBytes: number;
}) => {
  let bytes = 0;

  props.readStream.on("data", (chunk: any) => {
    bytes += chunk.length;
    //console.log(`Received ${bytes} bytes of data.`);

    // 2097152
    if (bytes > props.maxFileSizeBytes)
      props.readStream.destroy("Too big file...");
  });
};

export const withMaxFileSizeUpload = (props: {
  readStream: any;
  uploadStream: ({ readStream }: { readStream: any }) => Promise<any>;
  maxFileSizeBytes: number;
}) => {
  return new Promise<{ id: string }>((resolve, reject) => {
    /* const googleStream = createWriteStream(
        join(
          process.cwd(),
          "upload",
          `${Math.round(Math.random() * 10000)}-photo.jpeg`
        )
      ); */

    //const readd = createReadStream("/path");

    let bytes = 0;

    props.readStream.on("data", (chunk: any) => {
      bytes += chunk.length;
      //console.log(`Received ${bytes} bytes of data.`);

      // 2097152
      if (bytes > props.maxFileSizeBytes)
        props.readStream.destroy("Too big file...");
    });

    props
      .uploadStream({
        readStream: props.readStream,
      })
      .then((res: any) => {
        resolve(res);
      })
      .catch((error: any) => {
        reject(error);
      });

    /* props.readStream.pipe(googleStream);
      googleStream.on("error", (err) => {
        reject(err);
      });
      googleStream.on("finish", function () {
        console.log("FINISH", googleStream.bytesWritten);
        resolve({
          id: "google-drive-123",
        });
      }); */
  });
};

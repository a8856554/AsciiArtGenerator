try {
    switch (process.env.NODE_ENV) {
        case 'development':
            process.env.DB_URL=`postgres://${process.env.PG_USERNAME}:${process.env.PG_USERPASSPORT}@${process.env.PG_HOSTNAME}:${process.env.PG_PORT}/${process.env.PG_DB_NAME}`;
            process.env.SECRET = process.env.PG_SECRET;
            break;
        default: // 'staging' or 'production'
            process.env.DB_URL=`postgres://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`;
            break;
    }
} catch (err) {
    console.log(err, '\n\nError configuring the project. Have you set the environment veriables?');
}

global.Module = {
    onRuntimeInitialized() {
      // Do something after opencv.js is Initialized.
      console.log('opencv.js is loaded...')
    }
}
export default process.env;

import OrientDB from 'orientjs';
import * as Config from  "../config";

const dbServer = OrientDB({
  host: Config.host,
  port: Config.port,
  username: Config.ID,
  password: Config.PW
});

export const db = dbServer.use( Config.DB_TABLE );

import OrientDB from 'orientjs';
import * as Config from  "../config";

const dbServer = OrientDB({
  host: Config.host,
  port: Config.port,
  username: Config.ID,
  password: Config.PW
});


export const Class = Object.freeze ({
	User: "User"
});

export const Index = Object.freeze ({
	User: "User.id",
  UserToken: "User.snsToken"
});


export const db = dbServer.use( Config.DB_TABLE );

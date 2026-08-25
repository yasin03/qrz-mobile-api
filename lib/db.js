// db.js

import sql from "mssql";

// connection configs
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: { encrypt: false },
  requestTimeout: 15000, // ← varsayılan eskisi gibi kalsın
  connectionTimeout: 15000,
};

export async function ExecuteQuery(query, options = []) {
  try {
    let pool = await sql.connect(config);
    let request = pool.request();

    // Eğer options (parametre listesi) geldiyse, request.input ile bind et:
    if (Array.isArray(options) && options.length > 0) {
      options.forEach((p) => {
        request.input(p.name, sql[p.type], p.value);
      });
    }

    let products = await request.query(query);
    return products.recordsets[0];
  } catch (error) {
    console.log(error);
    throw Error(error);
  }
}

export async function ExecuteQueryDataset(query, timeoutMs) {
  try {
    let pool = await sql.connect(config);
    let request = pool.request();

    if (timeoutMs) {
      request.timeout = timeoutMs; // ← sadece çağıran yer belirtirse override edilir
    }

    let products = await request.query(query);
    return products.recordsets;
  } catch (error) {
    console.log(error);
    throw Error(error);
  }
}

export async function ExecuteStoredProcedure(query) {
  try {
    let pool = await sql.connect(config);
    let products = await pool.request().execute(query);
    return products.recordsets[0];
  } catch (error) {
    throw Error(error);
  }
  // finally{
  //   sql.close();
  // }
}

export async function ExecuteStoredProcedureWithParameters(request, query) {
  console.log(query);
  try {
    const { recordset } = await request.execute(query);
    return recordset;
  } catch (err) {
    console.log(err);
  }
  // finally{
  //   sql.close();
  // }
}

export const fnRequest = async () => {
  var conn = new sql.ConnectionPool(config);
  const conRequest = await conn.connect();
  return new sql.Request(conRequest);
};

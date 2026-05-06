import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const db = mysql.createPool(process.env.DATABASE_URL!)

async function seed() {
  console.log('Seeding database...')

  // Optional: wipe old data (safe order)
  await db.execute(`SET FOREIGN_KEY_CHECKS = 0`)
  await db.execute(`TRUNCATE TABLE receipt`)
  await db.execute(`TRUNCATE TABLE appointment`)
  await db.execute(`TRUNCATE TABLE request`)
  await db.execute(`TRUNCATE TABLE review`)
  await db.execute(`TRUNCATE TABLE servicer`)
  await db.execute(`TRUNCATE TABLE customer`)
  await db.execute(`SET FOREIGN_KEY_CHECKS = 1`)

  // ------------------------
  // CUSTOMERS (10)
  // ------------------------
  const customers = [
    ['Alice Johnson', '123 Main St', '9561111111', 'alice@test.com'],
    ['Bob Smith', '456 Oak St', '9561111112', 'bob@test.com'],
    ['Charlie Brown', '789 Pine St', '9561111113', 'charlie@test.com'],
    ['David Lee', '101 Elm St', '9561111114', 'david@test.com'],
    ['Emma Davis', '202 Cedar St', '9561111115', 'emma@test.com'],
    ['Frank Moore', '303 Birch St', '9561111116', 'frank@test.com'],
    ['Grace Kim', '404 Walnut St', '9561111117', 'grace@test.com'],
    ['Henry Lopez', '505 Maple St', '9561111118', 'henry@test.com'],
    ['Isabella Cruz', '606 Palm St', '9561111119', 'isa@test.com'],
    ['James Wilson', '707 River St', '9561111120', 'james@test.com'],
  ]

  for (const c of customers) {
    await db.execute(
      `INSERT INTO customer (name, address, phone_num, email, password)
       VALUES (?, ?, ?, ?, ?)`,
      [...c, '1234']
    )
  }

  // ------------------------
  // SERVICES
  // ------------------------
  await db.execute(`INSERT INTO service VALUES
    ('Plumbing', 'Pipe repair and installation'),
    ('Electrical', 'Wiring and repairs'),
    ('Cleaning', 'Home cleaning services')
  `)

  // ------------------------
  // COMPANIES
  // ------------------------
  await db.execute(`INSERT INTO company VALUES
    ('RGV Plumbing', 'Plumbing', 'Edinburg', '1111111111'),
    ('Bright Electric', 'Electrical', 'McAllen', '2222222222'),
    ('CleanPro', 'Cleaning', 'Pharr', '3333333333')
  `)

  // ------------------------
  // SERVICERS (10)
  // ------------------------
  const servicers = [
    ['John Cantu', 'john@rgv.com', 'RGV Plumbing'],
    ['Maria Lopez', 'maria@bright.com', 'Bright Electric'],
    ['Carlos Reyes', 'carlos@clean.com', 'CleanPro'],
    ['Ana Torres', 'ana@rgv.com', 'RGV Plumbing'],
    ['Luis Garcia', 'luis@bright.com', 'Bright Electric'],
    ['Sofia Martinez', 'sofia@clean.com', 'CleanPro'],
    ['Miguel Hernandez', 'miguel@rgv.com', 'RGV Plumbing'],
    ['Elena Rodriguez', 'elena@bright.com', 'Bright Electric'],
    ['Daniel Perez', 'daniel@clean.com', 'CleanPro'],
    ['Laura Gomez', 'laura@rgv.com', 'RGV Plumbing'],
  ]

  for (const s of servicers) {
    await db.execute(
      `INSERT INTO servicer (name, email, company_name)
       VALUES (?, ?, ?)`,
      s
    )
  }

  // ------------------------
  // REQUESTS + APPOINTMENTS + RECEIPTS + REVIEWS
  // ------------------------

  for (let i = 1; i <= 10; i++) {
    const customerId = i
    const servicerId = i

    // request
    await db.execute(
      `INSERT INTO request (customer_id, servicer_id, problem, address)
       VALUES (?, ?, ?, ?)`,
      [customerId, servicerId, 'Sample issue ' + i, i + ' Test St']
    )

    // appointment
    await db.execute(
      `INSERT INTO appointment (customer_id, servicer_id, contract_number, address, est_time)
       VALUES (?, ?, ?, ?, NOW())`,
      [customerId, servicerId, 1000 + i, i + ' Test St']
    )

    // receipt
    await db.execute(
      `INSERT INTO receipt (contract_number, price)
       VALUES (?, ?)`,
      [1000 + i, 50 + i * 10]
    )

    // review
    await db.execute(
      `INSERT INTO review (customer_id, servicer_id, rating, date, comment)
       VALUES (?, ?, ?, CURDATE(), ?)`,
      [customerId, servicerId, 5, 'Great service #' + i]
    )
  }

  console.log('Seeding complete ✅')
  process.exit()
}

seed()
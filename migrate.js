const sqlite3 = require('sqlite3');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.serialize(() => {
    db.run("ALTER TABLE tasks ADD COLUMN before_work TEXT;", (err) => {
        if (err) console.log(err.message);
        else console.log("Added before_work column");
    });
    db.run("ALTER TABLE tasks ADD COLUMN after_work TEXT;", (err) => {
        if (err) console.log(err.message);
        else console.log("Added after_work column");
    });
});
db.close();

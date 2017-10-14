const express = require('express');
const common = require('../libs/common');
const mysql = require('mysql');
const pathLib = require("path");
const fs = require("fs");

var db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '07690928wxq',
    database: 'learn'
});

module.exports = function () {
    var route = express.Router();
    route.get("/", (req, res) => {
        switch (req.query.act) {
            case 'mod':
                db.query(`SELECT * FROM custom_table WHERE ID=${req.query.id}`, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send("database eror").end();
                    } else if (res.data === 0) {
                        res.status(400).send("数据找不到的").end();
                    } else {
                        db.query('SELECT * FROM custom_table', (err, newData) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send("database error").end();
                            } else {
                                res.render("admin/custom.ejs", {
                                    customs: newData,
                                    mod_data: data[0]
                                })
                            }
                        })
                    }
                })
                break;
            case 'del':
                db.query(`SELECT * FROM custom_table WHERE ID=${req.query.id}`, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send("database error").end();
                    } else if (data.length === 0) {
                        res.status(400).send("没找到数据").end();
                    } else {
                        fs.unlink("static/upload/" + data[0].src, (err) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send("file error").end();
                            } else {
                                db.query(`DELETE FROM custom_table WHERE ID=${req.query.id}`, (err, data) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send("database error").end();
                                    } else {
                                        res.redirect("/admin/custom")
                                    }
                                })
                            }
                        })
                    }
                })
                break;
            default:
                db.query('SELECT * FROM custom_table', (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send("database error").end();
                    } else {
                        res.render("admin/custom.ejs", {
                            customs: data
                        })
                    }
                })
                break;
        }
    })

    route.post("/", (req, res) => {
        var title = req.body.title;
        var description = req.body.description;
        if (req.files[0]) {
            var ext = pathLib.parse(req.files[0].originalname).ext;
            var oldpath = req.files[0].path;
            var newpath = req.files[0].path + ext;
            var newFlieName = req.files[0].filename + ext;
        } else {
            var newFlieName = null;
        }
        if (newFlieName) {
            fs.rename(oldpath, newpath, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("重命名失败，请稍后").end();
                } else {
                    if (req.body.mod_id) {
                        db.query(`SELECT * FROM custom_table WHERE ID=${req.body.mod_id}`, (err, data) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send("修改失败了");
                            } else if (data.length === 0) {
                                res.status(400).send("数据不存在了");
                            } else {
                                fs.unlink("static/upload/" + data[0].src, (err) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send("flie error").end();
                                    } else {
                                        db.query(`UPDATE custom_table SET title='${title}', description='${description}',src='${newFlieName}' WHERE ID=${req.body.mod_id}`, (err, data) => {
                                            if (err) {
                                                console.log(err);
                                                res.status(500).send("修改失败了").end();

                                            } else {
                                                res.redirect("/admin/custom")
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    } else {
                        db.query(`INSERT INTO custom_table (title,description,src) VALUE ('${title}','${description}','${newFlieName}')`, (err, data) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send("database error").end();
                            } else {
                                res.redirect("/admin/custom")
                            }
                        })
                    }
                }
            })
        } else {
                if (req.body.mod_id) {
                    db.query(`UPDATE custom_table SET title='${title}', description='${description}' WHERE ID=${req.body.mod_id}`, (err, data) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send("修改失败了").end();
                        } else {
                            res.redirect("/admin/custom")
                        }
                    })
                } else {
                    db.query(`INSERT INTO custom_table (title,description,src) VALUE ('${title}','${description}','${newFlieName}')`, (err, data) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send("database error").end();
                        } else {
                            res.redirect("/admin/custom")
                        }
                    })
                }
            }
    })
    return route;
}
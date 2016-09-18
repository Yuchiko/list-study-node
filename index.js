'use strict';

var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var _ = require('lodash');
var app = express();
var bodyParser = require('body-parser');

var dburl = 'mongodb://localhost:27017/list';
var db;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

app.get('/lists/', function(req, res) {
	db.find().project({ _id:0 }).toArray((err, lists) => {
		if(err) {
			return res.json(err);
		}

		res.json(lists);
	});
});

app.get('/lists/:name/', function(req, res) {
	db.findOne({ name: req.params.name }, { _id:0 }, (err, list) => {
		if(err) {
			return res.json(err);
		}

		res.json(list);
	});
});

app.post('/lists/', function(req, res) {

	if(!req.body.name) {
		return res.status(400).send('Bad Request');
	}

	console.log(req.body.name);

	db.findOne({ name: req.body.name }, (list) => {

		console.log(list);
		
		if(list) {
			return res.status(409).send('List name duplicate')
		}

		db.insertOne({
			name: req.body.name,
			items: []
		}, (err, responce) => {
			if(err) {
				console.log(err);
				return res.send('Error with db')
			}

			res.json(responce);
		})
	});
});

app.patch('/lists/:name/', function(req, res) {

	if(!req.params.name) {
		return res.status(400).send('Bad Request');
	}

	var newList = {}

	if(req.body.name) {
		newList.name = req.body.name;
	}

	if(req.body.items) {
		newList.items = req.body.items;
	}

	db.updateOne({ name:req.params.name }, newList, (err, result) => {
		if(err) {
			console.log(err);
		}
		
		res.json({
			err:err,
			res:result
		});
	})
});

app.delete('/lists/:name/', function(req, res) {
	if(!req.params.name) {
		return res.status(400).send('Bad Request');
	}

	db.deleteOne({ name:req.params.name }, (err,result) => res.json({err, result}));
});


MongoClient.connect(dburl, function(err, connection) {
	if(err) throw err;

	db = connection.collection('list');

	app.listen(3000, function () {
		console.log('List app listening on port 3000!');
	});
});

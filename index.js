const MongoClient = require('mongodb').MongoClient;
const fs = require('fs')
const promisify = require('util').promisify
const ora = require('ora')

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const options = {
	url: 'mongodb://localhost:27017',
	dbName: 'hf05-node',
	collectionName: 'songJS'
}

const client = new MongoClient(options.url, {
	useNewUrlParser: true
});

let spinner = ora('Connection to the database').start()

client.connect(async function (err) {
	spinner.text = 'Connected...'
	const db = client.db(options.dbName);
	let data = []
	spinner.text = 'Reading the directories'
	let dir = await readdir('./data')
	spinner.text = `Read ${dir.length} filenames`
	dir.forEach(async (fileName) => {
		let dataContainment = fs.readFileSync('./data/' + fileName)
		data.push(JSON.parse(dataContainment))
	})

	spinner.text = `Dropping collection: ${options.collectionName}`
	db.dropCollection(options.collectionName)
	
	spinner.text = `Creating collection: ${options.collectionName}`
	const songCollection = db.collection(options.collectionName)
	let response = await songCollection.insertMany(data)
	
	
	spinner.stop();
	client.close();
	console.log(`Number of inserted documents: ${response.insertedCount}`)
});

var redis = require('redis')
  , gh    = require('grasshopper')

if (process.env.NODE_ENV === 'production'){
    db = redis.createClient(10088, 'cod.redistogo.com')
    db.auth('70db264e238bb23fa6beb0841206d08f', function(err){
        console.log("Error connecting to Redis")
    })
} else {
    db = redis.createClient(6379, '127.0.0.1')
}

function getOpinion(params){
    db.hgetall(params.id, function(err, obj){
        this.model['opinion'] = params.id
        this.model['yes'] = decodeURIComponent(params.yes || 'yes').substr(0, 30)
        this.model['no'] = decodeURIComponent(params.no || 'no').substr(0, 30)
        this.model['yes_count'] = (obj && obj.yes) || 0
        this.model['no_count'] = (obj && obj.no) || 0
        this.render('opinion')
    }.bind(this))
}

function vote(params){
    if (/^(yes|no)$/.test(params.vote)){
        console.log('INCR', params.id, '/', params.vote)
        db.hincrby(params.id, params.vote, 1)
    }
    this.response.setHeader('Content-Type', 'image/png')
    this.response.end('')
}

gh.get('/on/{id}/{yes}/{no}', getOpinion)

gh.get('/on/{id}/{vote}', vote)

gh.get('/on/{id}', getOpinion)

gh.get('/', function(){
    this.render('index')
})

gh.serve(3000)
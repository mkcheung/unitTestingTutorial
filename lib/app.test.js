const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const rewire = require('rewire');
const request = require('supertest');

var app = rewire('./app');
var users = require('./users');
var auth = require('./auth');
var sandbox = sinon.sandbox.create();


describe('utils', ()=> {
	afterEach(() => {
		app = rewire('./app');
	})

	context('GET /', ()=> {
		it('should get /', (done) =>{
			request(app).get('/')
				.expect(200)
				.end((err, response) => {
					expect(response.body).to.have.property('name').to.equal('Foo Fooing Bar');
					done(err);
				})
		});
	});

	context('POST /user', ()=> {
		let createStub, errorStub;
		it('should call user.create', (done) =>{
			
			createStub = sandbox.stub(users, 'create').resolves({name: 'foo'});

			request(app).post('/user').send({name:'fake'}).expect(200).end((err,response)=>{
				expect(createStub).to.have.been.calledOnce;
				expect(response.body).to.have.been.property('name').to.equal('foo');
				done(err);
			})
		});
		it('should call handleError on error', (done) =>{
			
			createStub = sandbox.stub(users, 'create').rejects(new Error('fake_error'));

			errorStub = sandbox.stub().callsFake((res, error)=>{
				return res.status(400).json({error: 'fake'});
			})

			app.__set__('handleError', errorStub);

			request(app).post('/user')
				.send({name:'fake'})
				.expect(400)
				.end((err, response) => {

					expect(createStub).to.have.been.calledOnce;
					expect(errorStub).to.have.been.calledOnce;
					expect(response.body).to.have.been.property('error').to.equal('fake');
					done(err);
				});
		});
	});
});

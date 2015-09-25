module.exports = function(ServiceUser) {


ServiceUser.signIn = function  (data,cb) {
	console.log(data);
	
	ServiceUser.find({'where':{'emailId':data.emailId}},function  (err,serviceUsers) {
		if (!err){
			if (serviceUsers.length!=0){
			cb(null,serviceUsers[0]);
				return;
			}else{

	ServiceUser.create(data,function  (err,serviceUser) {
		if (!err){
			cb(null,serviceUser);
		}else{
		cb(err);
		console.log(err);			
			}
		});
	}
	}else{
		cb(err);
		console.log(err);
		}
	});

}

ServiceUser.remoteMethod(
	'signIn',
	 {
      accepts: [
      { arg: 'serviceUser', type: 'object', required: true, http: { source:'body'} }
      ],
      http: {path: '/signIn', verb: 'post'},
      returns: {arg: 'serviceUser', type: 'object', root:true }
    }
);








};

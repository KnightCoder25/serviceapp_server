module.exports = function(Job) {


Job.request = function  (job,cb) {
	// creating here so that push can be send
	console.log(job);

	Job.create(job,function  (err,job) {
	
	if (!err){
		cb(null,job);
		// Call the push here
      // Send push notification to consumer
        
       var Notification = Job.app.models.notification;
       var note = new Notification({
         text:'You have a new job',
         notificationType:1
       });

       var ServiceUser = Job.app.models.serviceuser;

       ServiceUser.find({'where':{'skills':job.category }},function  (err,users) {
		if (!err){
			console.log(users);
			for (var i=0;i<users.length;i++){
				notify(users[i].id,note);
			}
		}else{
			cb(err);
			console.log(err);
		}       	
       });

	}else{
		cb(err);
		console.log(err);
	}

	});

}

Job.remoteMethod(
	'request',
	 {
      accepts: [
      { arg: 'job', type: 'object', required: true, http: { source:'body'} }
      ],
      http: {path: '/request', verb: 'post'},
      returns: {arg: 'job', type: 'object', root:true }
    }
);


Job.accept = function  (jobId,partnerId,cb) {
	// body...
	Job.findById(jobId,function  (err,job) {
		
		if (!err){
			if (job.partnerid){
				// Job is already assigned
				var defaultError = new Error('Job is already accepted');
                defaultError.statusCode = 421;
                defaultError.code = 'Job already accepted';
                cb(defaultError);

			}else{
				 job.updateAttribute('partnerid', partnerId, function(err, job){
				 	cb(null,job)

				 	var ServiceUser = Job.app.models.serviceuser;
				 	ServiceUser.findById(partnerId,function  (err,partner) {

				 	if (!err){

				 	var Notification = Job.app.models.notification;

				       var note = new Notification({
				         text:'You job is accepted',
				         notificationType:2,
				         partner:partner
				       });

				 		notify(job.customerid,note);

				 		}else{
				 			console.log(err);
				 		}
				 	});

				 });
				
			}
		}else{
			cb(err);
			console.log(err);
		}		


	});


}

Job.remoteMethod(
	'accept',
	 {
      accepts: [
      { arg: 'jobId', type: 'string', required: true, http: { source:'form'} },
      { arg: 'partnerId', type: 'string', required: true, http: { source:'form'}}

      ],
      http: {path: '/accept', verb: 'post'},
      returns: {arg: 'job', type: 'object', root:true }
    }
);

Job.list = function  (partnerId,cb) {
	// body...
	var ServiceUser = Job.app.models.serviceuser;
	ServiceUser.findById(partnerId,function  (err,user) {
		if (!err){

			Job.find({
				include: ['user'],
				where:{'category':{
					'inq':user.skills
				}
			}
		},function  (err,jobs) {
			
			if (!err){
				cb(null,jobs);
			}else{
				cb(err);
				console.log(err);
			}

		});

		}else{
			cb(err);
			console.log(err);
		}

	});

}

Job.remoteMethod(
	'list',
	 {
      accepts: [
      { arg: 'partnerId', type: 'string', required: true, http: { source:'form'} }
      ],
      http: {path: '/list', verb: 'post'},
      returns: {arg: 'job', type: 'object', root:true }
    }
);



Job.listUserJobs = function (userId,cb) {

	console.log("userID: "+userId);
	Job.find({
		include:['partner'],
		where:{'customerid':userId }
		},function (err,jobs) {
			if (!err){
				cb(null,jobs);
			}else{
				cb(err);
				console.log(err);
			}

	});
}

Job.remoteMethod(
	'listUserJobs',
	 {
      accepts: [
      { arg: 'userId', type: 'string', required: true, http: { source:'form'} }
      ],
      http: {path: '/users/list', verb: 'post'},
      returns: {arg: 'job', type: 'object', root:true }
    }
);



function notify (userId,note) {
	console.log("notify: "+userId);
	// body...
	var sendPush = Job.app.models.push;
 	sendPush.notifyByQuery(
         {
           userId: userId
         },
         note,
         function(err) {
           if (err) {
             console.error('Cannot notify %j: %s', userId,err.stack);
           };
           console.log('pushing  notification to %j', userId);
         });


	}


};

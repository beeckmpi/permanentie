exports.get = function (db, params) {
  return db.collection('users').findOne({googleid: params.id}).then(function (user) {
    return {
      user: user
    };
  });
};

exports.getIndex = function(db) {
  return db.collection('users').find().sort({displayName: -1}).toArray().then(function(users){
    // docs is an array of all the documents in mycollection
   return users;
  });
};

exports.put = function(db, params) {
  if (params.userRole == 'NC'){
    var data = {$set:{location: params.location}};
  } else if (params.location == 'NC'){
    var data = {$set:{userRole: params.userRole}};
  }
  return db.collection('users').update({googleid: params.id}, data).then(function(user){
    return {
      user: user
    };
  });
};

exports.putHelp = function(db, params) {
  var help = params.help;
  var data = {};
  data[params.help] = true;
  return db.collection('users').update({googleid: params.user}, {$set: {help: data}}).then(function(user){
    return {
      user: user
    };
  });
};

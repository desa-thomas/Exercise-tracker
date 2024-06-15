const { Model } = require("mongoose");

/**
 *
 * @param {Model} User - User model
 * @param {String} username - Username
 * @param {Callback} done - Call back funciton
 */
function createUser(User, username, done) {
  let user = new User({ username: username });

  user.save(function (err, document) {
    if (err) return console.error(err);

    console.log("User Saved:", document);
    done(null, document);
  });
}

/**
 * Creates exercise document and saves it to database
 * @param {Model} User
 * @param {Model} Exercise
 * @param {String} id
 * @param {String} description
 * @param {Number} duration
 * @param {Date} date -optional
 * @param {Callback} done
 */
function createExercise(
  User,
  Exercise,
  id,
  description,
  duration,
  date,
  done
) {
  //if date field is null, set it to current date
  let exercise;

  User.findById(id, function (err, user) {
    if (err) {
      done(err, null, null);
      return console.error(err);
    }

    //if user exists in db
    if (user) {
      //if date was given
      if (date) {
        let d = date.split("-")
        let dateObj = new Date(Number(d[0]), Number(d[1])-1, Number(d[2]))

        exercise = new Exercise({
          user_id: id,
          description: description,
          duration: duration,
          dateObj: dateObj,
          date: dateObj.toDateString()
        });
      } else {
        exercise = new Exercise({
          user_id: id,
          description: description,
          duration: duration,
        });
      }

      exercise.save(function (err, exercise) {
        if (err) {
          done(err, null, null);
          return console.error(err);
        }

        console.log("exercise created", exercise);
        done(null, user, exercise);
      });
    } 
    //If user does not exist 
    else {
      console.log("User does not exist");
      done("User does not exist", null,null);
    }
  });
}
/**
 *
 * @param {Model} User - User model
 * @param {Callback} done - callback function
 */
function getAllUsers(User, done) {
  User.find(function (err, users) {
    if (err) return console.error(err);

    done(null, users);
  });
}

/**
 * Get the exercise log of a user given their ID 
 * @param {Model} User 
 * @param {Model} Exercise 
 * @param {*} id 
 * @param {*} done 
 */
function getLog(User, Exercise, id, queryParam, done){
  User.findById(id, function(err, user){
    if(err){
      done(err, null, null)
      return console.error(err)
    }

    if(!user){
      console.log("User does not exist")
      done("User does not exist", null, null)
    }

    //If user is found 
    else{
      //If no query parameters (from, to, limit)

        let query = Exercise.find({user_id: id})
        .select({_id: 0, user_id: 0, __v: 0, dateObj: 0})

        if(queryParam){
          if(queryParam.from){
            query.where("dateObj").gte(queryParam.from)
          }
          if(queryParam.to){
            query.where("dateObj").lte(queryParam.to)
          }
          if(queryParam.limit){
            query.limit(Number(queryParam.limit))
          }
        }
        query.exec(function(err, log){
          if(err){
            done(err, null, null)
            return console.error(err)
          }
          //else return log and user
          done(null, user, log)
        })
     
    }

  })
}

module.exports = {
  createUser,
  getAllUsers,
  createExercise,
  getLog
};

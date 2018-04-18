
/**
 * @desc Customer Controller
 */
module.exports = {
    /**
     * @desc Get List of Customer
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getList: function (req, res) { 
        var timestamp = req.body.timestamp;        
        //Set default where condition
        var wherecondtion = {
                roleId:3,
                isDelete : 0
            };
        var condtionCustomer = {};
        //Set where condition with timestamp
        if(typeof timestamp != 'undefined' && timestamp != '' && timestamp != null) {
            wherecondtion.createdOn = {$lt : timestamp};
        }
        if(typeof req.body.name != 'undefined' && req.body.name != '' && req.body.name != null) {
            wherecondtion.name = {$like : '%'+req.body.name+'%'};
        }
        if(typeof req.body.email != 'undefined' && req.body.email != '' && req.body.email != null) {
            wherecondtion.email = {$like : '%'+req.body.email+'%'};
        }
        if(typeof req.body.mobile != 'undefined' && req.body.mobile != '' && req.body.mobile != null) {
            condtionCustomer.mobile = {$like : '%'+req.body.mobile+'%'};
        }
        models.users.findAll({
            attributes: ['id','name','email','isActive','createdOn'],
            where: wherecondtion,
            order :"createdOn DESC",
            limit : 50,
            include: [{
                where : condtionCustomer,
                attributes: ['mobile','dob'],
                model: models.customerdetails,
                required: true
            }],
            required: false,
        }).then(function(data) {            
            if(data !== null) {
                return res.json({
                    success: true,
                    result: data,
                    count: data.length
                });
            } else {
                return res.status(404).send({
                    success: false,
                    message: appMessage.user.customer.error.dataNotFound
                });
            }
        }).catch(function(error){
            helper.formatResponse('', res, error);
        });       
    },
    /**
     * @desc Get User Details
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    viewDetails: function (req, res) {
       models.users.findOne({
            attributes: ['id','name','email','isActive','createdOn'],
            where: {id:req.params.id},
            include: [{
                attributes: ['mobile','dob'],
                model: models.customerdetails,
                required: false
            }],
            required: false
        }).then(function (user) {
            var resData = {id: user.id, email: user.email, name: user.name};            
            if(typeof user.customerdetail != 'undefined' && user.customerdetail != '' && user.customerdetail != null) {
                resData.dob = user.customerdetail.dob;
                resData.mobile = user.customerdetail.mobile;
            }
            return res.json({
                success: true,
                message: 'Profile data.',
                result: resData
            });
        }).catch(Sequelize.ValidationError, function (err) {
            return res.status(422).send(err.errors);
        }).catch(function (err) {
            return res.status(400).send({
                success: false,
                message: err.message
            });
        });
    },
}
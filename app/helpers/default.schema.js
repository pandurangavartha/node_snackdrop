module.exports = {
    users: [
        {
            name: "Super Admin",
            email: "superadmin@gmail.com",
            password: "$2a$10$UxwAcHKPP3uEqzdxR4OyX.gyd.rWY/4SHW4Q3upfD5zlZ7Es9aQoO",
            isDelete: false,
            isActive: true,
        }
    ],
    roles :[
        {
            id : 1,
            name : "Super Admin"
        },
        {
            id : 2,
            name : "Vendor Admin"
        },
        {
            id : 3,
            name : "User"
        },
        {
            id : 4,
            name : "Guest User"
        },
    ],
    devicetypes :[
        {
            id : 1,
            name : "Web"
        },
        {
            id : 2,
            name : "Android"
        },
        {
            id : 3,
            name : "iOS"
        },
    ],
    cmspages :[
        {
            id : 1,
            title: "Terms & Conditions",
            content : "Terms & Conditions",
            isActive : 0,
            isDelete : 1,
            createdBy : 1,
            updatedBy : 1,
        },
        {
            id : 2,
            title: "Privacy Policy",
            content : "Privacy Policy",
            isActive : 0,
            isDelete : 1,
            createdBy : 1,
            updatedBy : 1,
        },
    ],
    settings : [
        {
            id : 1,
            fields : "deliveryCharge",
            values : "100",
            updatedBy : 1,
        }
    ]
}
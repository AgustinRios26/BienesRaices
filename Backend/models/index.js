import Property from './Property.js'
import Price from './Price.js'
import Category from './Category.js'
import Users from './Users.js'

// Price.hasOne(Property)

Property.belongsTo(Price, {foreignKey: 'priceId'})
Property.belongsTo(Category, {foreignKey: 'categoryId'})
Property.belongsTo(Users, {foreignKey: 'userId'})

export{
    Property,
    Price,
    Category,
    Users
}
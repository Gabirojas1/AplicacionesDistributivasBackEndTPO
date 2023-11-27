const { Sequelize, DataTypes } = require('sequelize');
const { sq } = require('../db/database');

const constants = require('../common/constants');

const Comment = sq.define('comment', {
  commentId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  inmobiliariaUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  authorUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  authorName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  authorPhoto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reviewType: {
    type: DataTypes.ENUM,
    values: Object.values(constants.ReviewTypesEnum),
  },
},
{
  tableName: 'comment',
});

module.exports = Comment;

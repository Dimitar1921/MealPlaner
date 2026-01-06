const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Meal = sequelize.define('Meal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  day: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']]
    }
  },
  mealType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['breakfast', 'lunch', 'dinner', 'snack']]
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  protein: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  carbs: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  fat: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  recipeData: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('recipeData');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('recipeData', value ? JSON.stringify(value) : null);
    }
  }
}, {
  timestamps: true
});

// Define associations
User.hasMany(Meal, { foreignKey: 'userId', as: 'meals' });
Meal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Meal;



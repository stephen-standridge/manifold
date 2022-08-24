import './globals'
import manifoldConstructor from '../core/index'
// import manifoldConfiguration from '../core/config'
const manifoldConfiguration = require("../core/config").default;
require('dotenv').config();

const programName = process.env.PIECE_SLUG + (process.env.CONFIG_ENV && '_' + process.env.CONFIG_ENV) || '';

const Manifold = manifoldConstructor({ /*options*/ }, { /*ENV*/ });
Manifold.load(programName, manifoldConfiguration, {});

global.Manifold = Manifold;

export default Manifold;


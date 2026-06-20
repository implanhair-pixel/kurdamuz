const React = require('react');
function createMotionTag(tag){return React.forwardRef(function MotionComponent(props, ref){const {initial,animate,exit,transition,variants,whileHover,whileTap,layout,layoutId,viewport,whileInView,...rest}=props; return React.createElement(tag,{...rest,ref});});}
const motion = new Proxy({}, { get: (_target, prop) => createMotionTag(prop) });
function AnimatePresence(props){ return React.createElement(React.Fragment, null, props.children); }
module.exports = { motion, AnimatePresence };

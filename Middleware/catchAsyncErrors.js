module.exports = (functionFromParticularControllerRequest) => (req , res , next) => {


      Promise.resolve(functionFromParticularControllerRequest(req , res , next)).catch(next)


}
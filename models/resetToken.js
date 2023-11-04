const bcrypt = require("bcryptjs/dist/bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resetTokenSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "user",
		unique: true,
	},
	token: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, expires: 3600, default:Date.now() },
});
resetTokenSchema.pre("save", async function (next){
    if(this.isModified("token")){
        const hash = await bcrypt.hash(this.token, 8);
        this.token = hash;
    }
    next();
});

resetTokenSchema.methods.compareToken = async function (token){
    const result = await bcrypt.compareSync(token, this.token);
    return result;
}

module.exports = mongoose.model("resetToken", resetTokenSchema);
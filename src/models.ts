import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export interface IFact {
    factId: string;
    factTitle: string;
    factDescription: string;
    isStarred: boolean;
    isMastered: boolean;
    isActive: boolean;
    lastSeenAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategory {
    categoryId: string;
    categoryName: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    facts: IFact[];
}

export interface IUser extends Document {
    userId: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    passwordHash: string;
    role: 'standard' | 'admin';
    categories: ICategory[];
}

//Schemas

const IFactSchema: Schema = new Schema({
    factId: { type: String, required: true, unique: true },
    factTitle: { type: String, required: true },
    factDescription: { type: String, required: true },
    isStarred: { type: Boolean, default: false },
    isMastered: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const ICategorySchema: Schema = new Schema({
    categoryId: { type: String, required: true, unique: true },
    categoryName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    facts: { type: [Schema.Types.ObjectId], ref: 'Fact' },
}, { _id: false });

const IUserSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    passwordHash: { type: String, required: [true, 'Password is required'] },
    role: { type: String, enum: ['standard', 'admin'], default: 'standard', required: true },
    categories: { type: [Schema.Types.ObjectId], ref: 'Category' },
}, {timestamps: true});

// 3. Security Hook: Hash the Password before saving
// We use a pre-save hook that runs before a document is saved to the database.
IUserSchema.pre('save', async function(next) {
  const user = this as any;

  // Only hash the password if it has been modified (or is new)
  // The client side sends the plain password in the 'passwordHash' field temporarily
  if (!user.isModified('passwordHash')) {
    return next();
  }

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    next();
  } catch (error) {
    // Pass the error to Mongoose
    next(error as Error);
  }
});


// 4. Utility Method (for future Login logic)
// This method will be used later to compare an incoming password with the stored hash
IUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};


export const User = mongoose.model<IUser>('User', IUserSchema);
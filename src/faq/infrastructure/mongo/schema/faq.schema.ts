import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Faq {
  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  })
  question: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
  })
  answer: string;
}

export type FaqDocument = Faq & Document;
export const FaqSchema = SchemaFactory.createForClass(Faq);

import { BirthdayData } from './types';
import { getAge } from './interface';

type CongratMessage = (record: BirthdayData) => string;

const messages: CongratMessage[] = [
  ({ pronoun, name, date }) =>
    `🎂 O bebé de hoje é ${pronoun} *${name}* que faz ${Math.round(
      getAge(date),
    )} anos! 🥳🎉 Parabéns ${name}, FELICIDADE SEM FIM ❤️❤️❤️`,
  ({ pronoun, name, date }) =>
    `🎂 Hoje é o dia d${pronoun} *${name}* que celebra ${Math.round(
      getAge(date),
    )} anos! 🥳🎉 Muitos parabéns ${name}, FELICIDADE SEM FIM ❤️❤️❤️`,
  ({ pronoun, name, date }) =>
    `🎂 Que dia épico! ${pronoun.toUpperCase()} *${name}* faz anos e conta já com ${Math.round(
      getAge(date),
    )} aninhos! 🥳🎉 Parabéns ${name}, FELICIDADE SEM FIM ❤️❤️❤️`,
  ({ pronoun, name, date }) =>
    `🎂 ${pronoun.toUpperCase()} noss${pronoun} *${name}* faz hoje ${Math.round(
      getAge(date),
    )} anos! 🥳🎉 Parabéns ${name}, FELICIDADE SEM FIM ❤️❤️❤️`,
];

export default messages;

import { bench } from 'vitest';
import { getStringLineEndings } from '../dist/index';

const separator = '\r\n';
const snippet =
    `Aut adipisci sit qui. Enim quibusdam accusamus cum fugiat. Officiis qui veritatis facilis sint tempora impedit omnis. Quo in et quam. Doloremque quia soluta laborum tenetur consequatur itaque.{{SEP}}` +
    `Sunt consectetur delectus non quasi pariatur. Totam excepturi quo voluptatem. In consequatur et sint ullam et odio similique non. Pariatur consectetur eveniet eos qui perspiciatis ut. Ipsa facere accusamus qui corporis quasi.{{SEP}}` +
    `Odio non perspiciatis in. Adipisci voluptatem sed tempore quam facilis in ea dolorem sint. Ad quae ex quidem corrupti beatae aspernatur qui. Aliquid perspiciatis et est laboriosam. Esse debitis debitis est minus omnis.{{SEP}}`;
const testData = snippet.replaceAll('{{SEP}}', separator).repeat(100_000);

bench(
    'string',
    async () => {
        await getStringLineEndings(testData);
    },
    { time: 1000 }
);

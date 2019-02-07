import * as React from 'react';
import { Slide, Heading, Link } from 'spectacle';
import { MonoText } from '../presentation';

export default (
    <Slide transition={['zoom']} bgColor="secondary">
        <Heading size={4} textColor="cyan">
            About
        </Heading>
        <Link
            textColor="primary"
            href="https://github.com/saschagrunert"
            target="_blank">
            <MonoText> saschagrunert</MonoText>
        </Link>
    </Slide>
);

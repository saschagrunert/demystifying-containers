import * as React from 'react';
import { Slide, Heading, Link } from 'spectacle';

export default (
    <Slide transition={['zoom']} bgColor="secondary">
        <Heading size={6} textColor="cyan">
            About
        </Heading>
        <Link
            textColor="primary"
            href="https://github.com/saschagrunert"
            target="_blank">
            github.com/saschagrunert
        </Link>
    </Slide>
);

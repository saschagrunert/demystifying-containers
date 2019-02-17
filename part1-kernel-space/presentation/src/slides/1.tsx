import * as React from 'react';
import { Slide, Image, Heading } from 'spectacle';
import * as img from '../images';

export default (
    <Slide transition={['zoom']} bgColor="secondary">
        <Heading size={4} lineHeight={1.5} textColor="purple">
            Demystifying Containers
        </Heading>
        <Image src={img.images.logo} />
        <Heading size={6} textColor="primary">
            Part I - Kernel Space
        </Heading>
    </Slide>
);

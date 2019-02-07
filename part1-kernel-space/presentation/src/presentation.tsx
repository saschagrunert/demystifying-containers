import * as React from 'react';
import { Deck, Text } from 'spectacle';
import styled from 'react-emotion';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import createTheme from 'spectacle/lib/themes/default';
import './images';

require('normalize.css');
library.add(fas);

const theme = createTheme(
    {
        primary: '#f8f8f2',
        secondary: '#282a36',
        cyan: '#8be9fd',
        green: '#50fa7b',
        orange: '#ffb86c',
        pink: '#ff79c6',
        purple: '#bd93f9',
        red: '#ff5555',
        yellow: '#f1fa8c',
    },
    {
        primary: { name: 'Roboto', googleFont: true, styles: ['400', '700'] },
    },
);

export const MonoText = styled(Text)`
    font-family: Meslo;
    color: #f8f8f2;
`;

interface State {
    slides?: React.ReactElement<any>[];
}

export class Presentation extends React.Component<{}, State> {
    state: State = {};

    componentDidMount() {
        const slidesContext = require.context(
            './slides',
            true,
            /(.*\/.*.tsx)$/,
        );
        const loadedSlides = slidesContext
            .keys()
            .reduce<React.ReactElement<any>[]>((acc, id) => {
                const slideModule = slidesContext(id).default;
                if (slideModule instanceof Array) {
                    slideModule.forEach(sm => acc.push(sm));
                } else {
                    acc.push(slideModule);
                }
                return acc;
            }, []);

        this.setState({
            slides: loadedSlides,
        });
    }
    render() {
        if (!this.state.slides) {
            return <div>Loading...</div>;
        }

        return (
            <Deck
                progress={'bar'}
                showFullscreenControl={false}
                transition={['zoom', 'slide', 'fade', 'spin']}
                transitionDuration={500}
                theme={theme}>
                {this.state.slides.map((slide, index) => {
                    return React.cloneElement(slide, { key: index });
                })}
            </Deck>
        );
    }
}

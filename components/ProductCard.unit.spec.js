import { mount } from '@vue/test-utils';
import ProductCard from '@/components/ProductCard';
import { makeServer } from '@/miragejs/server';
import { cartState } from '@/state';

const mountProductCard = (server) => {
  const product = server.create('product', {
    title: 'Beautiful watch',
    price: '23.00',
    image:
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80',
  });
  return {
    wrapper: mount(ProductCard, {
      propsData: {
        product,
      },
    }),
    product,
  };
};

describe('ProductCard - unit', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
    cartState.items = [];
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should match snapshot', () => {
    const { wrapper } = mountProductCard(server);

    expect(wrapper.element).toMatchSnapshot();
  });

  it('should mount the component', () => {
    const { wrapper } = mountProductCard(server);

    expect(wrapper.vm).toBeDefined();
    expect(wrapper.text()).toContain('Beautiful watch');
    expect(wrapper.text()).toContain('$23.00');
  });

  it('should add item to cartState on button click', async () => {
    const { wrapper, product } = mountProductCard(server);

    await wrapper.find('button').trigger('click');

    expect(cartState.items).toHaveLength(1);
    expect(cartState.items).toEqual([product]);
  });

  it('should ensure product is not added to cart twice', async () => {
    const { wrapper, product } = mountProductCard(server);

    await wrapper.find('button').trigger('click');
    await wrapper.find('button').trigger('click');

    expect(cartState.items).toHaveLength(1);
    expect(cartState.items).toEqual([product]);
  });
});

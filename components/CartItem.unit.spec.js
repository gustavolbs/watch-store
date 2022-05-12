import { mount } from '@vue/test-utils';
import CartItem from '@/components/CartItem';
import { makeServer } from '@/miragejs/server';

const mountCartItem = (server) => {
  const product = server.create('product', {
    title: 'Beatiful watch',
    price: '22.33',
  });

  const wrapper = mount(CartItem, {
    propsData: {
      product,
    },
  });

  return { wrapper, product };
};

describe('CartItem - unit', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', () => {
    const { wrapper } = mountCartItem(server);

    expect(wrapper.vm).toBeDefined();
  });

  it('should display product info', () => {
    const {
      wrapper,
      product: { title, price },
    } = mountCartItem(server);
    const content = wrapper.text();

    expect(content).toContain(title);
    expect(content).toContain(price);
  });

  it('should display quantity 1 when product is first displayed', () => {
    const { wrapper } = mountCartItem(server);
    const quantity = wrapper.find('[data-testid="quantity"]');

    expect(quantity.text()).toContain('1');
  });

  it('should increase quantity when add button is clicked', async () => {
    const { wrapper } = mountCartItem(server);
    const quantity = wrapper.find('[data-testid="quantity"]');
    const button = wrapper.find('[data-testid="add-button"]');

    await button.trigger('click');
    expect(quantity.text()).toContain('2');
    await button.trigger('click');
    expect(quantity.text()).toContain('3');
    await button.trigger('click');
    expect(quantity.text()).toContain('4');
  });

  it('should decrease quantity when add button is clicked', async () => {
    const { wrapper } = mountCartItem(server);
    const quantity = wrapper.find('[data-testid="quantity"]');
    const button = wrapper.find('[data-testid="subtract-button"]');

    await button.trigger('click');

    expect(quantity.text()).toContain('0');
  });

  it('should not go below zero when decrease button is repeatedly clicked', async () => {
    const { wrapper } = mountCartItem(server);
    const quantity = wrapper.find('[data-testid="quantity"]');
    const button = wrapper.find('[data-testid="subtract-button"]');

    await button.trigger('click');
    expect(quantity.text()).toContain('0');
    await button.trigger('click');
    expect(quantity.text()).not.toContain('-1');
  });
});

import { mount } from '@vue/test-utils';
import Vue from 'vue';
import Cart from '@/components/Cart';
import CartItem from '@/components/CartItem';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

describe('Cart - unit', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  const mountCart = (server) => {
    const products = server.createList('product', 2);

    const cartManager = new CartManager();

    const wrapper = mount(Cart, {
      propsData: {
        products,
      },
      mocks: {
        $cart: cartManager,
      },
    });

    return { wrapper, products, cartManager };
  };

  it('should mount the component', () => {
    const { wrapper } = mountCart(server);

    expect(wrapper.vm).toBeDefined();
  });

  it('should not display empty cart button when there are no products', () => {
    const { cartManager } = mountCart(server);

    const wrapper = mount(Cart, {
      mocks: {
        $cart: cartManager,
      },
    });

    expect(wrapper.find('[data-testid="clear-cart-button"]').exists()).toBe(
      false
    );
  });

  it('should emit close event when button gets clicked', async () => {
    const { wrapper } = mountCart(server);

    const button = wrapper.find('[data-testid="close-button"]');

    await button.trigger('click');

    expect(wrapper.emitted().close).toBeTruthy();
    expect(wrapper.emitted().close).toHaveLength(1);
  });

  it('should hide the cart when no prop isOpen is passed', () => {
    const { wrapper } = mountCart(server);

    expect(wrapper.classes()).toContain('hidden');
  });

  it('should display the cart when prop isOpen is passed', async () => {
    const { wrapper } = mountCart(server);

    await wrapper.setProps({
      isOpen: true,
    });

    expect(wrapper.classes()).not.toContain('hidden');
  });

  it('should display "Cart is empty" when there are no products', async () => {
    const { wrapper } = mountCart(server);

    wrapper.setProps({
      products: [],
    });

    await Vue.nextTick();

    expect(wrapper.text()).toContain('Cart is empty');
  });

  it('should display 2 instances of CartItem when 2 products are provided', () => {
    const { wrapper } = mountCart(server);

    expect(wrapper.text()).not.toContain('Cart is empty');
    expect(wrapper.findAllComponents(CartItem)).toHaveLength(2);
  });

  it('should display a button to clear cart', () => {
    const { wrapper } = mountCart(server);
    const button = wrapper.find('[data-testid="clear-cart-button"]');

    expect(button.exists()).toBe(true);
  });

  it('should call cart manager clearProducts() when button gets clicked', async () => {
    const { wrapper, cartManager } = mountCart(server);
    const button = wrapper.find('[data-testid="clear-cart-button"]');
    const spy = jest.spyOn(cartManager, 'clearProducts');

    await button.trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(cartManager.getState().items).toHaveLength(0);
    expect(cartManager.getState().open).toBe(false);
  });

  it('should display an input type e-mail when there are items in the cart', () => {
    const { wrapper } = mountCart(server);
    const input = wrapper.find('input[type="email"]');

    expect(input.exists()).toBe(true);
  });

  it('should hide the input type e-mail when there are NO items in the cart', async () => {
    const { wrapper } = mountCart(server);

    wrapper.setProps({
      products: [],
    });

    await Vue.nextTick();

    const input = wrapper.find('input[type="email"]');

    expect(input.exists()).toBe(false);
  });

  it('should emit checkout event and send email when checkout button is clicked', async () => {
    const { wrapper } = mountCart(server);
    const form = wrapper.find('[data-testid="checkout-form"]');
    const input = wrapper.find('input[type="email"]');
    const email = 'vedovelli@gmail.com';

    input.setValue(email);

    await form.trigger('submit');

    expect(wrapper.emitted().checkout).toBeTruthy();
    expect(wrapper.emitted().checkout).toHaveLength(1);
    expect(wrapper.emitted().checkout[0][0]).toEqual({
      email,
    });
  });

  it('should NOT emit checkout event when input email is empty', async () => {
    const { wrapper } = mountCart(server);
    const button = wrapper.find('[data-testid="checkout-button"]');

    await button.trigger('click');

    expect(wrapper.emitted().checkout).toBeFalsy();
  });
});

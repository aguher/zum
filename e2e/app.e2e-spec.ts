import { DashboardTangoPage } from './app.po';

describe('dashboard-tango App', () => {
  let page: DashboardTangoPage;

  beforeEach(() => {
    page = new DashboardTangoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

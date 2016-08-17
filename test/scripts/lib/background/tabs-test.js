import '~/test/helper';
import subject from '~/app/scripts/lib/background/tabs';

describe('export', () => {
  it('should exist', () => {
    expect(subject).to.be.a('function');
  });
});

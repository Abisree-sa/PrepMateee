import app from './app';
import { ENV } from './config/env';

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 PlacementReady Backend running on http://localhost:${PORT}`);
  console.log(`🎓 College Domain enforced: @${ENV.COLLEGE_DOMAIN}`);
  console.log(`====================================================`);
});

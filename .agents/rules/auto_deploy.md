# Auto Git Commit, Push & Vercel Deployment Rule

After completing any code edit or modification (even minor changes):
1. Run `git add .`
2. Create a git commit with a clear message: `git commit -m "<description of change>"`
3. Push to GitHub: `git push origin main`
4. Deploy to Vercel production: `npx vercel --prod --yes`

# Adding the Official OTS Logo

To replace the placeholder "OTS" circle with the official logo:

1. Download the official OTS logo from:
   - [Air University OTS page](https://www.airuniversity.af.edu/Holm-Center/OTS/)
   - [Air Force Accessions Center](https://www.afaccessionscenter.af.mil/Holm-Center/OTS/)

2. Save the logo as `ots-logo.png` in this `public` folder

3. Update `app/dashboard/page.tsx` to use the image:
   Replace this:
   ```jsx
   <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-blue-900 text-xl border-4 border-blue-700">
     OTS
   </div>
   ```
   
   With this:
   ```jsx
   <img 
     src="/ots-logo.png" 
     alt="OTS Logo" 
     className="w-16 h-16 object-contain"
   />
   ```

4. Commit and push the changes

## Air Force Brand Guidelines

- **Air Force Blue**: #00308F (RGB: 0, 48, 143)
- **Yellow/Gold**: #FFC72C (RGB: 255, 199, 44)
- Always maintain proper respect for official Air Force insignia and branding

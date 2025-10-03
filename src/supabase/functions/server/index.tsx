import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Demo account configurations
const DEMO_ACCOUNTS = [
  { email: 'patient@demo.com', password: 'demo123', name: 'Demo Patient', role: 'patient' },
  { email: 'provider@demo.com', password: 'demo123', name: 'Dr. Demo Provider', role: 'provider' }
];

// Helper function to ensure demo account exists
async function ensureDemoAccountExists(email: string, password: string, name: string, role: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Check if user already exists in KV
    const existingUser = await kv.get(`demo:${email}`);
    
    if (existingUser) {
      console.log(`Demo account already exists: ${email}`);
      return { success: true, userId: existingUser.userId };
    }

    // Try to create user
    console.log(`Creating demo account: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });

    if (authError) {
      // Check if user already exists in Supabase but not in our KV
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        console.log(`Demo account exists in Supabase, fetching user: ${email}`);
        // Try to get the user by email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        
        if (!listError && users) {
          const existingSupabaseUser = users.find(u => u.email === email);
          if (existingSupabaseUser) {
            // Update password to ensure it matches
            await supabase.auth.admin.updateUserById(existingSupabaseUser.id, {
              password,
              user_metadata: { name, role }
            });
            
            // Store in KV
            await kv.set(`user:${existingSupabaseUser.id}`, {
              id: existingSupabaseUser.id,
              email,
              name,
              role,
              createdAt: new Date().toISOString()
            });
            await kv.set(`demo:${email}`, { created: true, userId: existingSupabaseUser.id });
            
            console.log(`Demo account synced: ${email}`);
            return { success: true, userId: existingSupabaseUser.id };
          }
        }
      }
      
      console.error(`Error creating demo account ${email}:`, authError.message);
      return { success: false, error: authError.message };
    }

    // Store in KV
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    });
    await kv.set(`demo:${email}`, { created: true, userId: authData.user.id });
    
    console.log(`Demo account created successfully: ${email}`);
    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error(`Failed to ensure demo account ${email}:`, error);
    return { success: false, error: String(error) };
  }
}

// Initialize demo accounts on startup
(async () => {
  console.log('Initializing demo accounts...');
  for (const account of DEMO_ACCOUNTS) {
    await ensureDemoAccountExists(account.email, account.password, account.name, account.role);
  }
  console.log('Demo accounts initialization complete');
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-50d6a062/health", async (c) => {
  const demoStatus = [];
  for (const account of DEMO_ACCOUNTS) {
    const exists = await kv.get(`demo:${account.email}`);
    demoStatus.push({
      email: account.email,
      exists: !!exists
    });
  }
  return c.json({ 
    status: "ok",
    demoAccounts: demoStatus 
  });
});

// Endpoint to manually initialize demo accounts
app.post("/make-server-50d6a062/init-demo-accounts", async (c) => {
  console.log('Manual demo account initialization requested');
  const results = [];
  
  for (const account of DEMO_ACCOUNTS) {
    const result = await ensureDemoAccountExists(account.email, account.password, account.name, account.role);
    results.push({
      email: account.email,
      ...result
    });
  }
  
  return c.json({ 
    success: true,
    results 
  });
});

// Signup endpoint
app.post("/make-server-50d6a062/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create user in Supabase Auth
    // Automatically confirm the user's email since an email server hasn't been configured.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });

    if (authError) {
      console.error('Auth error during signup:', authError);
      // Check if user already exists
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        return c.json({ error: 'An account with this email already exists. Please login instead.' }, 400);
      }
      return c.json({ error: authError.message }, 400);
    }

    // Store additional user data in KV store
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    });

    // Generate access token for immediate login
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: authData.user.id
    });

    if (sessionError) {
      console.error('Session error during signup:', sessionError);
      return c.json({ error: sessionError.message }, 400);
    }

    return c.json({
      accessToken: sessionData.session.access_token,
      role
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Login endpoint
app.post("/make-server-50d6a062/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Check if this is a demo account and ensure it exists
    const demoAccount = DEMO_ACCOUNTS.find(acc => acc.email === email);
    if (demoAccount && password === demoAccount.password) {
      console.log(`Demo account login attempt: ${email}`);
      await ensureDemoAccountExists(demoAccount.email, demoAccount.password, demoAccount.name, demoAccount.role);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      console.error('Login error details:', JSON.stringify(error));
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${data.user.id}`);

    console.log(`Login successful for: ${email}, role: ${userData?.role || data.user.user_metadata?.role || 'patient'}`);

    return c.json({
      accessToken: data.session.access_token,
      role: userData?.role || data.user.user_metadata?.role || 'patient'
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get user data endpoint (protected)
app.get("/make-server-50d6a062/user", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error('User fetch error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${user.id}`);

    return c.json({
      id: user.id,
      email: user.email,
      name: userData?.name || user.user_metadata?.name || 'User',
      role: userData?.role || user.user_metadata?.role || 'patient'
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to fetch user data' }, 500);
  }
});

// ===== PATIENT PROFILE ENDPOINTS =====

// Get patient profile
app.get("/make-server-50d6a062/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get profile data from KV store
    const profile = await kv.get(`profile:${user.id}`);

    if (!profile) {
      // Return default profile structure
      return c.json({
        legalName: '',
        chosenName: '',
        otherNames: '',
        pronouns: '',
        dateOfBirth: '',
        genderIdentity: '',
        sexAssignedAtBirth: '',
        sexualOrientation: '',
        bloodType: '',
        height: '',
        weight: '',
        allergies: '',
        medicalConditions: '',
        genderAffirmingCare: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceGroupNumber: '',
        primaryPhysician: '',
        pharmacyName: '',
        pharmacyPhone: ''
      });
    }

    return c.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update patient profile
app.put("/make-server-50d6a062/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();

    // Store profile data in KV store
    await kv.set(`profile:${user.id}`, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });

    console.log(`Profile updated for user: ${user.id}`);

    return c.json({ success: true, profile: profileData });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ===== MEDICATION ENDPOINTS =====

// Get all medications for a user
app.get("/make-server-50d6a062/medications", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all medications for this user
    const medications = await kv.getByPrefix(`medication:${user.id}:`);

    return c.json(medications || []);
  } catch (error) {
    console.error('Get medications error:', error);
    return c.json({ error: 'Failed to fetch medications' }, 500);
  }
});

// Add new medication
app.post("/make-server-50d6a062/medications", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const medicationData = await c.req.json();

    // Generate unique ID
    const medicationId = crypto.randomUUID();

    const medication = {
      id: medicationId,
      ...medicationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store medication in KV store
    await kv.set(`medication:${user.id}:${medicationId}`, medication);

    console.log(`Medication added for user ${user.id}: ${medication.name}`);

    return c.json({ success: true, medication });
  } catch (error) {
    console.error('Add medication error:', error);
    return c.json({ error: 'Failed to add medication' }, 500);
  }
});

// Update medication
app.put("/make-server-50d6a062/medications/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const medicationId = c.req.param('id');
    const medicationData = await c.req.json();

    // Get existing medication
    const existing = await kv.get(`medication:${user.id}:${medicationId}`);

    if (!existing) {
      return c.json({ error: 'Medication not found' }, 404);
    }

    const medication = {
      ...existing,
      ...medicationData,
      id: medicationId,
      updatedAt: new Date().toISOString()
    };

    // Update medication in KV store
    await kv.set(`medication:${user.id}:${medicationId}`, medication);

    console.log(`Medication updated for user ${user.id}: ${medication.name}`);

    return c.json({ success: true, medication });
  } catch (error) {
    console.error('Update medication error:', error);
    return c.json({ error: 'Failed to update medication' }, 500);
  }
});

// Delete medication
app.delete("/make-server-50d6a062/medications/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const medicationId = c.req.param('id');

    // Delete medication from KV store
    await kv.del(`medication:${user.id}:${medicationId}`);

    console.log(`Medication deleted for user ${user.id}: ${medicationId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete medication error:', error);
    return c.json({ error: 'Failed to delete medication' }, 500);
  }
});

// ===== HEALTHCARE PROVIDERS ENDPOINTS =====

// Get all healthcare providers for a user
app.get("/make-server-50d6a062/providers", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const providers = await kv.getByPrefix(`provider:${user.id}:`);

    return c.json(providers || []);
  } catch (error) {
    console.error('Get providers error:', error);
    return c.json({ error: 'Failed to fetch providers' }, 500);
  }
});

// Add new provider
app.post("/make-server-50d6a062/providers", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const providerData = await c.req.json();
    const providerId = crypto.randomUUID();

    const provider = {
      id: providerId,
      ...providerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`provider:${user.id}:${providerId}`, provider);

    console.log(`Provider added for user ${user.id}: ${provider.name}`);

    return c.json({ success: true, provider });
  } catch (error) {
    console.error('Add provider error:', error);
    return c.json({ error: 'Failed to add provider' }, 500);
  }
});

// Update provider
app.put("/make-server-50d6a062/providers/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const providerId = c.req.param('id');
    const providerData = await c.req.json();

    const existing = await kv.get(`provider:${user.id}:${providerId}`);

    if (!existing) {
      return c.json({ error: 'Provider not found' }, 404);
    }

    const provider = {
      ...existing,
      ...providerData,
      id: providerId,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`provider:${user.id}:${providerId}`, provider);

    console.log(`Provider updated for user ${user.id}: ${provider.name}`);

    return c.json({ success: true, provider });
  } catch (error) {
    console.error('Update provider error:', error);
    return c.json({ error: 'Failed to update provider' }, 500);
  }
});

// Delete provider
app.delete("/make-server-50d6a062/providers/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const providerId = c.req.param('id');

    await kv.del(`provider:${user.id}:${providerId}`);

    console.log(`Provider deleted for user ${user.id}: ${providerId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete provider error:', error);
    return c.json({ error: 'Failed to delete provider' }, 500);
  }
});

// ===== EMERGENCY CONTACTS ENDPOINTS =====

// Get all emergency contacts for a user
app.get("/make-server-50d6a062/emergency-contacts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const contacts = await kv.getByPrefix(`emergency-contact:${user.id}:`);

    return c.json(contacts || []);
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    return c.json({ error: 'Failed to fetch emergency contacts' }, 500);
  }
});

// Add new emergency contact
app.post("/make-server-50d6a062/emergency-contacts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const contactData = await c.req.json();
    const contactId = crypto.randomUUID();

    const contact = {
      id: contactId,
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`emergency-contact:${user.id}:${contactId}`, contact);

    console.log(`Emergency contact added for user ${user.id}: ${contact.name}`);

    return c.json({ success: true, contact });
  } catch (error) {
    console.error('Add emergency contact error:', error);
    return c.json({ error: 'Failed to add emergency contact' }, 500);
  }
});

// Update emergency contact
app.put("/make-server-50d6a062/emergency-contacts/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const contactId = c.req.param('id');
    const contactData = await c.req.json();

    const existing = await kv.get(`emergency-contact:${user.id}:${contactId}`);

    if (!existing) {
      return c.json({ error: 'Emergency contact not found' }, 404);
    }

    const contact = {
      ...existing,
      ...contactData,
      id: contactId,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`emergency-contact:${user.id}:${contactId}`, contact);

    console.log(`Emergency contact updated for user ${user.id}: ${contact.name}`);

    return c.json({ success: true, contact });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    return c.json({ error: 'Failed to update emergency contact' }, 500);
  }
});

// Delete emergency contact
app.delete("/make-server-50d6a062/emergency-contacts/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const contactId = c.req.param('id');

    await kv.del(`emergency-contact:${user.id}:${contactId}`);

    console.log(`Emergency contact deleted for user ${user.id}: ${contactId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete emergency contact error:', error);
    return c.json({ error: 'Failed to delete emergency contact' }, 500);
  }
});

// ===== KUPAT HOLIM ENDPOINTS =====

// Get all Kupat Holim entries for a user
app.get("/make-server-50d6a062/kupat-holim", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const kupatHolim = await kv.getByPrefix(`kupat-holim:${user.id}:`);

    return c.json(kupatHolim || []);
  } catch (error) {
    console.error('Get Kupat Holim error:', error);
    return c.json({ error: 'Failed to fetch Kupat Holim' }, 500);
  }
});

// Add new Kupat Holim entry
app.post("/make-server-50d6a062/kupat-holim", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const kupatHolimData = await c.req.json();
    const kupatHolimId = crypto.randomUUID();

    const kupatHolim = {
      id: kupatHolimId,
      ...kupatHolimData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`kupat-holim:${user.id}:${kupatHolimId}`, kupatHolim);

    console.log(`Kupat Holim added for user ${user.id}: ${kupatHolim.provider}`);

    return c.json({ success: true, kupatHolim });
  } catch (error) {
    console.error('Add Kupat Holim error:', error);
    return c.json({ error: 'Failed to add Kupat Holim' }, 500);
  }
});

// Update Kupat Holim entry
app.put("/make-server-50d6a062/kupat-holim/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const kupatHolimId = c.req.param('id');
    const kupatHolimData = await c.req.json();

    const existing = await kv.get(`kupat-holim:${user.id}:${kupatHolimId}`);

    if (!existing) {
      return c.json({ error: 'Kupat Holim not found' }, 404);
    }

    const kupatHolim = {
      ...existing,
      ...kupatHolimData,
      id: kupatHolimId,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`kupat-holim:${user.id}:${kupatHolimId}`, kupatHolim);

    console.log(`Kupat Holim updated for user ${user.id}: ${kupatHolim.provider}`);

    return c.json({ success: true, kupatHolim });
  } catch (error) {
    console.error('Update Kupat Holim error:', error);
    return c.json({ error: 'Failed to update Kupat Holim' }, 500);
  }
});

// Delete Kupat Holim entry
app.delete("/make-server-50d6a062/kupat-holim/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const kupatHolimId = c.req.param('id');

    await kv.del(`kupat-holim:${user.id}:${kupatHolimId}`);

    console.log(`Kupat Holim deleted for user ${user.id}: ${kupatHolimId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete Kupat Holim error:', error);
    return c.json({ error: 'Failed to delete Kupat Holim' }, 500);
  }
});

// ===== HEALTH HISTORY ENDPOINTS =====

// Get health history for a user
app.get("/make-server-50d6a062/health-history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const history = await kv.get(`health-history:${user.id}`);

    if (!history) {
      // Return default structure
      return c.json({
        // Personal Mental Health
        mentalHealthConditions: [],
        currentMentalHealthTreatment: '',
        pastMentalHealthTreatment: '',
        psychiatricHospitalizations: [],
        currentMedications: '',
        substanceUse: {
          alcohol: '',
          tobacco: '',
          recreationalDrugs: '',
          cannabis: ''
        },
        // Personal Physical Health
        chronicConditions: [],
        surgeries: [],
        hospitalizations: [],
        currentPhysicalSymptoms: '',
        reproductiveHealth: {
          menstrualHistory: '',
          pregnancies: '',
          sexualHealth: ''
        },
        // Familial History
        familyMentalHealth: [],
        familyPhysicalHealth: [],
        // Genetic History
        geneticConditions: [],
        geneticTestResults: [],
        geneticTesting: '',
        ethnicity: '',
        consanguinity: false
      });
    }

    return c.json(history);
  } catch (error) {
    console.error('Get health history error:', error);
    return c.json({ error: 'Failed to fetch health history' }, 500);
  }
});

// Update health history
app.put("/make-server-50d6a062/health-history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const historyData = await c.req.json();

    await kv.set(`health-history:${user.id}`, {
      ...historyData,
      updatedAt: new Date().toISOString()
    });

    console.log(`Health history updated for user: ${user.id}`);

    return c.json({ success: true, history: historyData });
  } catch (error) {
    console.error('Update health history error:', error);
    return c.json({ error: 'Failed to update health history' }, 500);
  }
});

// ===== MEDICAL DOCUMENTS ENDPOINTS =====

app.get("/make-server-50d6a062/documents", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const documents = await kv.getByPrefix(`document:${user.id}:`);
    return c.json(documents || []);
  } catch (error) {
    console.error('Get documents error:', error);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

app.post("/make-server-50d6a062/documents", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const documentData = await c.req.json();
    const documentId = crypto.randomUUID();

    const document = {
      id: documentId,
      ...documentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`document:${user.id}:${documentId}`, document);
    return c.json({ success: true, document });
  } catch (error) {
    console.error('Add document error:', error);
    return c.json({ error: 'Failed to add document' }, 500);
  }
});

app.delete("/make-server-50d6a062/documents/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const documentId = c.req.param('id');

    // Get document to find storage path
    const document = await kv.get(`document:${user.id}:${documentId}`);

    // Delete from storage if file exists
    if (document && document.storagePath) {
      try {
        await supabase.storage.from('medical-documents').remove([document.storagePath]);
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
    }

    // Delete from KV
    await kv.del(`document:${user.id}:${documentId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    return c.json({ error: 'Failed to delete document' }, 500);
  }
});

// Upload file endpoint
app.post("/make-server-50d6a062/documents/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json({ error: 'File size exceeds 10MB limit' }, 400);
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Allowed: PDF, images, Word, text files' }, 400);
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-documents')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('medical-documents')
      .getPublicUrl(fileName);

    return c.json({
      success: true,
      storagePath: fileName,
      publicUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Download file endpoint
app.get("/make-server-50d6a062/documents/:id/download", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const documentId = c.req.param('id');
    const document = await kv.get(`document:${user.id}:${documentId}`);

    if (!document || !document.storagePath) {
      return c.json({ error: 'Document not found or no file attached' }, 404);
    }

    // Get signed URL for download
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('medical-documents')
      .createSignedUrl(document.storagePath, 60); // Valid for 60 seconds

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return c.json({ error: 'Failed to generate download link' }, 500);
    }

    return c.json({
      success: true,
      downloadUrl: signedUrlData.signedUrl,
      fileName: document.fileName
    });
  } catch (error) {
    console.error('Download error:', error);
    return c.json({ error: 'Failed to download file' }, 500);
  }
});

// ===== APPOINTMENTS ENDPOINTS =====

app.get("/make-server-50d6a062/appointments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const appointments = await kv.getByPrefix(`appointment:${user.id}:`);
    return c.json(appointments || []);
  } catch (error) {
    console.error('Get appointments error:', error);
    return c.json({ error: 'Failed to fetch appointments' }, 500);
  }
});

app.post("/make-server-50d6a062/appointments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const appointmentData = await c.req.json();
    const appointmentId = crypto.randomUUID();

    const appointment = {
      id: appointmentId,
      ...appointmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`appointment:${user.id}:${appointmentId}`, appointment);
    return c.json({ success: true, appointment });
  } catch (error) {
    console.error('Add appointment error:', error);
    return c.json({ error: 'Failed to add appointment' }, 500);
  }
});

app.put("/make-server-50d6a062/appointments/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const appointmentId = c.req.param('id');
    const appointmentData = await c.req.json();
    const existing = await kv.get(`appointment:${user.id}:${appointmentId}`);

    if (!existing) return c.json({ error: 'Appointment not found' }, 404);

    const appointment = {
      ...existing,
      ...appointmentData,
      id: appointmentId,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`appointment:${user.id}:${appointmentId}`, appointment);
    return c.json({ success: true, appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    return c.json({ error: 'Failed to update appointment' }, 500);
  }
});

app.delete("/make-server-50d6a062/appointments/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const appointmentId = c.req.param('id');
    await kv.del(`appointment:${user.id}:${appointmentId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return c.json({ error: 'Failed to delete appointment' }, 500);
  }
});

// ===== LAB RESULTS & VITALS ENDPOINTS =====

app.get("/make-server-50d6a062/lab-results", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const labResults = await kv.getByPrefix(`lab-result:${user.id}:`);
    return c.json(labResults || []);
  } catch (error) {
    console.error('Get lab results error:', error);
    return c.json({ error: 'Failed to fetch lab results' }, 500);
  }
});

app.post("/make-server-50d6a062/lab-results", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const labResultData = await c.req.json();
    const labResultId = crypto.randomUUID();

    const labResult = {
      id: labResultId,
      ...labResultData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`lab-result:${user.id}:${labResultId}`, labResult);
    return c.json({ success: true, labResult });
  } catch (error) {
    console.error('Add lab result error:', error);
    return c.json({ error: 'Failed to add lab result' }, 500);
  }
});

app.get("/make-server-50d6a062/vitals", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const vitals = await kv.getByPrefix(`vital:${user.id}:`);
    return c.json(vitals || []);
  } catch (error) {
    console.error('Get vitals error:', error);
    return c.json({ error: 'Failed to fetch vitals' }, 500);
  }
});

app.post("/make-server-50d6a062/vitals", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const vitalData = await c.req.json();
    const vitalId = crypto.randomUUID();

    const vital = {
      id: vitalId,
      ...vitalData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`vital:${user.id}:${vitalId}`, vital);
    return c.json({ success: true, vital });
  } catch (error) {
    console.error('Add vital error:', error);
    return c.json({ error: 'Failed to add vital' }, 500);
  }
});

// ===== SYMPTOM TRACKING ENDPOINTS =====

app.get("/make-server-50d6a062/symptoms", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const symptoms = await kv.getByPrefix(`symptom:${user.id}:`);
    return c.json(symptoms || []);
  } catch (error) {
    console.error('Get symptoms error:', error);
    return c.json({ error: 'Failed to fetch symptoms' }, 500);
  }
});

app.post("/make-server-50d6a062/symptoms", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const symptomData = await c.req.json();
    const symptomId = crypto.randomUUID();

    const symptom = {
      id: symptomId,
      ...symptomData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`symptom:${user.id}:${symptomId}`, symptom);
    return c.json({ success: true, symptom });
  } catch (error) {
    console.error('Add symptom error:', error);
    return c.json({ error: 'Failed to add symptom' }, 500);
  }
});

app.delete("/make-server-50d6a062/symptoms/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const symptomId = c.req.param('id');
    await kv.del(`symptom:${user.id}:${symptomId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete symptom error:', error);
    return c.json({ error: 'Failed to delete symptom' }, 500);
  }
});

// ===== MESSAGES ENDPOINTS =====

app.get("/make-server-50d6a062/messages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const messages = await kv.getByPrefix(`message:${user.id}:`);
    return c.json(messages || []);
  } catch (error) {
    console.error('Get messages error:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

app.post("/make-server-50d6a062/messages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const messageData = await c.req.json();
    const messageId = crypto.randomUUID();

    const message = {
      id: messageId,
      ...messageData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`message:${user.id}:${messageId}`, message);
    return c.json({ success: true, message });
  } catch (error) {
    console.error('Add message error:', error);
    return c.json({ error: 'Failed to add message' }, 500);
  }
});

// ===== CARE TEAM ENDPOINTS =====

app.get("/make-server-50d6a062/care-team", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const careTeam = await kv.getByPrefix(`care-team:${user.id}:`);
    return c.json(careTeam || []);
  } catch (error) {
    console.error('Get care team error:', error);
    return c.json({ error: 'Failed to fetch care team' }, 500);
  }
});

app.post("/make-server-50d6a062/care-team", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const memberData = await c.req.json();
    const memberId = crypto.randomUUID();

    const member = {
      id: memberId,
      ...memberData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`care-team:${user.id}:${memberId}`, member);
    return c.json({ success: true, member });
  } catch (error) {
    console.error('Add care team member error:', error);
    return c.json({ error: 'Failed to add care team member' }, 500);
  }
});

app.delete("/make-server-50d6a062/care-team/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const memberId = c.req.param('id');
    await kv.del(`care-team:${user.id}:${memberId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete care team member error:', error);
    return c.json({ error: 'Failed to delete care team member' }, 500);
  }
});

// ===== INSURANCE & BILLING ENDPOINTS =====

app.get("/make-server-50d6a062/insurance", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const insurance = await kv.get(`insurance:${user.id}`);
    return c.json(insurance || { policies: [], claims: [], payments: [] });
  } catch (error) {
    console.error('Get insurance error:', error);
    return c.json({ error: 'Failed to fetch insurance' }, 500);
  }
});

app.put("/make-server-50d6a062/insurance", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const insuranceData = await c.req.json();
    await kv.set(`insurance:${user.id}`, {
      ...insuranceData,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true, insurance: insuranceData });
  } catch (error) {
    console.error('Update insurance error:', error);
    return c.json({ error: 'Failed to update insurance' }, 500);
  }
});

// ===== HEALTH GOALS & REMINDERS ENDPOINTS =====

app.get("/make-server-50d6a062/goals", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const goals = await kv.getByPrefix(`goal:${user.id}:`);
    return c.json(goals || []);
  } catch (error) {
    console.error('Get goals error:', error);
    return c.json({ error: 'Failed to fetch goals' }, 500);
  }
});

app.post("/make-server-50d6a062/goals", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const goalData = await c.req.json();
    const goalId = crypto.randomUUID();

    const goal = {
      id: goalId,
      ...goalData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`goal:${user.id}:${goalId}`, goal);
    return c.json({ success: true, goal });
  } catch (error) {
    console.error('Add goal error:', error);
    return c.json({ error: 'Failed to add goal' }, 500);
  }
});

app.put("/make-server-50d6a062/goals/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const goalId = c.req.param('id');
    const goalData = await c.req.json();
    const existing = await kv.get(`goal:${user.id}:${goalId}`);

    if (!existing) return c.json({ error: 'Goal not found' }, 404);

    const goal = {
      ...existing,
      ...goalData,
      id: goalId,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`goal:${user.id}:${goalId}`, goal);
    return c.json({ success: true, goal });
  } catch (error) {
    console.error('Update goal error:', error);
    return c.json({ error: 'Failed to update goal' }, 500);
  }
});

app.delete("/make-server-50d6a062/goals/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const goalId = c.req.param('id');
    await kv.del(`goal:${user.id}:${goalId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete goal error:', error);
    return c.json({ error: 'Failed to delete goal' }, 500);
  }
});

// ===== MENTAL HEALTH QUESTIONNAIRES ENDPOINTS =====

app.get("/make-server-50d6a062/questionnaires", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const questionnaires = await kv.getByPrefix(`questionnaire:${user.id}:`);
    return c.json(questionnaires || []);
  } catch (error) {
    console.error('Get questionnaires error:', error);
    return c.json({ error: 'Failed to fetch questionnaires' }, 500);
  }
});

app.post("/make-server-50d6a062/questionnaires", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const questionnaireData = await c.req.json();
    const questionnaireId = crypto.randomUUID();

    const questionnaire = {
      id: questionnaireId,
      ...questionnaireData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`questionnaire:${user.id}:${questionnaireId}`, questionnaire);
    return c.json({ success: true, questionnaire });
  } catch (error) {
    console.error('Add questionnaire error:', error);
    return c.json({ error: 'Failed to add questionnaire' }, 500);
  }
});

// ===== ASSIGNED QUESTIONNAIRES ENDPOINTS =====

app.get("/make-server-50d6a062/assigned-questionnaires", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const assignments = await kv.get(`assigned-questionnaires:${user.id}`);
    return c.json({ questionnaireIds: assignments?.questionnaireIds || [] });
  } catch (error) {
    console.error('Get assigned questionnaires error:', error);
    return c.json({ error: 'Failed to fetch assigned questionnaires' }, 500);
  }
});

app.put("/make-server-50d6a062/assigned-questionnaires", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const { questionnaireIds } = await c.req.json();

    await kv.set(`assigned-questionnaires:${user.id}`, {
      questionnaireIds,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true, questionnaireIds });
  } catch (error) {
    console.error('Update assigned questionnaires error:', error);
    return c.json({ error: 'Failed to update assigned questionnaires' }, 500);
  }
});

// ========== PERIOD TRACKING ENDPOINTS ==========
app.get("/make-server-50d6a062/periods", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const periods = await kv.getByPrefix(`period:${user.id}:`);
    return c.json({ periods: periods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()) });
  } catch (error) {
    console.error('Get periods error:', error);
    return c.json({ error: 'Failed to fetch periods' }, 500);
  }
});

app.post("/make-server-50d6a062/periods", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const periodData = await c.req.json();
    const periodId = crypto.randomUUID();

    const period = {
      id: periodId,
      ...periodData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`period:${user.id}:${periodId}`, period);
    return c.json({ success: true, period });
  } catch (error) {
    console.error('Add period error:', error);
    return c.json({ error: 'Failed to add period' }, 500);
  }
});

// ========== MEDIA LIBRARY ENDPOINTS ==========
app.get("/make-server-50d6a062/media", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const mediaItems = await kv.getByPrefix(`media:${user.id}:`);
    return c.json({ mediaItems: mediaItems.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()) });
  } catch (error) {
    console.error('Get media error:', error);
    return c.json({ error: 'Failed to fetch media' }, 500);
  }
});

app.post("/make-server-50d6a062/media", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const mediaData = await c.req.json();
    const mediaId = crypto.randomUUID();

    const media = {
      id: mediaId,
      ...mediaData,
      uploadedAt: new Date().toISOString()
    };

    await kv.set(`media:${user.id}:${mediaId}`, media);
    return c.json({ success: true, media });
  } catch (error) {
    console.error('Add media error:', error);
    return c.json({ error: 'Failed to add media' }, 500);
  }
});

app.delete("/make-server-50d6a062/media/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const mediaId = c.req.param('id');
    await kv.delete(`media:${user.id}:${mediaId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return c.json({ error: 'Failed to delete media' }, 500);
  }
});

// ========== MEDICAL IMAGING ENDPOINTS ==========
app.get("/make-server-50d6a062/imaging", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const studies = await kv.getByPrefix(`imaging:${user.id}:`);
    return c.json({ studies: studies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
  } catch (error) {
    console.error('Get imaging error:', error);
    return c.json({ error: 'Failed to fetch imaging studies' }, 500);
  }
});

app.post("/make-server-50d6a062/imaging", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const imagingData = await c.req.json();
    const imagingId = crypto.randomUUID();

    const study = {
      id: imagingId,
      ...imagingData,
      imageCount: 0,
      createdAt: new Date().toISOString()
    };

    await kv.set(`imaging:${user.id}:${imagingId}`, study);
    return c.json({ success: true, study });
  } catch (error) {
    console.error('Add imaging error:', error);
    return c.json({ error: 'Failed to add imaging study' }, 500);
  }
});

// ========== JOURNAL ENDPOINTS ==========
app.get("/make-server-50d6a062/journal", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const entries = await kv.getByPrefix(`journal:${user.id}:`);
    return c.json({ entries: entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  } catch (error) {
    console.error('Get journal error:', error);
    return c.json({ error: 'Failed to fetch journal entries' }, 500);
  }
});

app.post("/make-server-50d6a062/journal", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const entryData = await c.req.json();
    const entryId = crypto.randomUUID();

    const entry = {
      id: entryId,
      ...entryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`journal:${user.id}:${entryId}`, entry);
    return c.json({ success: true, entry });
  } catch (error) {
    console.error('Add journal entry error:', error);
    return c.json({ error: 'Failed to add journal entry' }, 500);
  }
});

app.delete("/make-server-50d6a062/journal/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const entryId = c.req.param('id');
    await kv.delete(`journal:${user.id}:${entryId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return c.json({ error: 'Failed to delete entry' }, 500);
  }
});

// ========== TODO LISTS ENDPOINTS ==========
app.get("/make-server-50d6a062/todos", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const todos = await kv.getByPrefix(`todo:${user.id}:`);
    return c.json({ todos: todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  } catch (error) {
    console.error('Get todos error:', error);
    return c.json({ error: 'Failed to fetch todos' }, 500);
  }
});

app.post("/make-server-50d6a062/todos", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const todoData = await c.req.json();
    const todoId = crypto.randomUUID();

    const todo = {
      id: todoId,
      ...todoData,
      completed: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`todo:${user.id}:${todoId}`, todo);
    return c.json({ success: true, todo });
  } catch (error) {
    console.error('Add todo error:', error);
    return c.json({ error: 'Failed to add todo' }, 500);
  }
});

app.put("/make-server-50d6a062/todos/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const todoId = c.req.param('id');
    const updates = await c.req.json();

    const existing = await kv.get(`todo:${user.id}:${todoId}`);
    if (!existing) return c.json({ error: 'Todo not found' }, 404);

    const updated = { ...existing, ...updates };
    await kv.set(`todo:${user.id}:${todoId}`, updated);
    return c.json({ success: true, todo: updated });
  } catch (error) {
    console.error('Update todo error:', error);
    return c.json({ error: 'Failed to update todo' }, 500);
  }
});

// ========== FOLLOW-UP PLANS ENDPOINTS ==========
app.get("/make-server-50d6a062/follow-up-plans", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const plans = await kv.getByPrefix(`follow-up-plan:${user.id}:`);
    return c.json({ plans: plans.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) });
  } catch (error) {
    console.error('Get follow-up plans error:', error);
    return c.json({ error: 'Failed to fetch plans' }, 500);
  }
});

app.post("/make-server-50d6a062/follow-up-plans", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const planData = await c.req.json();
    const planId = crypto.randomUUID();

    const plan = {
      id: planId,
      ...planData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`follow-up-plan:${user.id}:${planId}`, plan);
    return c.json({ success: true, plan });
  } catch (error) {
    console.error('Add follow-up plan error:', error);
    return c.json({ error: 'Failed to add plan' }, 500);
  }
});

// ========== TICKET SYSTEM ENDPOINTS ==========
app.get("/make-server-50d6a062/tickets", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const tickets = await kv.getByPrefix(`ticket:${user.id}:`);
    return c.json({ tickets: tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  } catch (error) {
    console.error('Get tickets error:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

app.post("/make-server-50d6a062/tickets", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const ticketData = await c.req.json();
    const ticketId = crypto.randomUUID();

    const ticket = {
      id: ticketId,
      ...ticketData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`ticket:${user.id}:${ticketId}`, ticket);
    return c.json({ success: true, ticket });
  } catch (error) {
    console.error('Add ticket error:', error);
    return c.json({ error: 'Failed to create ticket' }, 500);
  }
});

// ========== COMMUNITY PLATFORM ENDPOINTS ==========
app.get("/make-server-50d6a062/community/posts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const posts = await kv.getByPrefix(`community-post:`);
    return c.json({ posts: posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  } catch (error) {
    console.error('Get community posts error:', error);
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

app.post("/make-server-50d6a062/community/posts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const postData = await c.req.json();
    const postId = crypto.randomUUID();

    const userData = await kv.get(`user:${user.id}`);

    const post = {
      id: postId,
      author: postData.isAnonymous ? "Anonymous" : (userData?.name || "User"),
      authorInitials: postData.isAnonymous ? "A" : (userData?.name?.[0] || "U"),
      ...postData,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString()
    };

    await kv.set(`community-post:${postId}`, post);
    return c.json({ success: true, post });
  } catch (error) {
    console.error('Create community post error:', error);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

app.post("/make-server-50d6a062/community/posts/:id/like", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const postId = c.req.param('id');
    const post = await kv.get(`community-post:${postId}`);
    if (!post) return c.json({ error: 'Post not found' }, 404);

    post.likes = (post.likes || 0) + 1;
    await kv.set(`community-post:${postId}`, post);
    return c.json({ success: true });
  } catch (error) {
    console.error('Like post error:', error);
    return c.json({ error: 'Failed to like post' }, 500);
  }
});

// ===== GENDER IDENTITY ENDPOINT =====

app.get("/make-server-50d6a062/gender-identity", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const genderIdentity = await kv.get(`gender-identity:${user.id}`);
    return c.json({ data: genderIdentity || null });
  } catch (error) {
    console.error('Get gender identity error:', error);
    return c.json({ error: 'Failed to fetch gender identity' }, 500);
  }
});

app.put("/make-server-50d6a062/gender-identity", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const genderData = await c.req.json();
    await kv.set(`gender-identity:${user.id}`, genderData);
    return c.json({ success: true, data: genderData });
  } catch (error) {
    console.error('Update gender identity error:', error);
    return c.json({ error: 'Failed to update gender identity' }, 500);
  }
});

// ===== CONSENT & BOUNDARIES ENDPOINT =====

app.get("/make-server-50d6a062/consent-boundaries", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const consentBoundaries = await kv.get(`consent-boundaries:${user.id}`);
    return c.json({ data: consentBoundaries || null });
  } catch (error) {
    console.error('Get consent boundaries error:', error);
    return c.json({ error: 'Failed to fetch consent boundaries' }, 500);
  }
});

app.put("/make-server-50d6a062/consent-boundaries", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const boundariesData = await c.req.json();
    await kv.set(`consent-boundaries:${user.id}`, boundariesData);
    return c.json({ success: true, data: boundariesData });
  } catch (error) {
    console.error('Update consent boundaries error:', error);
    return c.json({ error: 'Failed to update consent boundaries' }, 500);
  }
});

// ===== TRANSITION CARE TRACKING ENDPOINT =====

app.get("/make-server-50d6a062/transition-care", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const transitionCare = await kv.get(`transition-care:${user.id}`);
    return c.json({ data: transitionCare || null });
  } catch (error) {
    console.error('Get transition care error:', error);
    return c.json({ error: 'Failed to fetch transition care data' }, 500);
  }
});

app.put("/make-server-50d6a062/transition-care", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const transitionData = await c.req.json();
    await kv.set(`transition-care:${user.id}`, transitionData);
    return c.json({ success: true, data: transitionData });
  } catch (error) {
    console.error('Update transition care error:', error);
    return c.json({ error: 'Failed to update transition care data' }, 500);
  }
});

// ===== SAFETY PLANNING ENDPOINT =====

app.get("/make-server-50d6a062/safety-planning", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const safetyPlan = await kv.get(`safety-plan:${user.id}`);
    return c.json({ data: safetyPlan || null });
  } catch (error) {
    console.error('Get safety planning error:', error);
    return c.json({ error: 'Failed to fetch safety plan' }, 500);
  }
});

app.put("/make-server-50d6a062/safety-planning", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const safetyData = await c.req.json();
    await kv.set(`safety-plan:${user.id}`, safetyData);
    return c.json({ success: true, data: safetyData });
  } catch (error) {
    console.error('Update safety planning error:', error);
    return c.json({ error: 'Failed to update safety plan' }, 500);
  }
});

// ===== BODY MAPPING ENDPOINT =====

app.get("/make-server-50d6a062/body-mapping", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const bodyMapping = await kv.get(`body-mapping:${user.id}`);
    return c.json({ data: bodyMapping || null });
  } catch (error) {
    console.error('Get body mapping error:', error);
    return c.json({ error: 'Failed to fetch body mapping' }, 500);
  }
});

app.put("/make-server-50d6a062/body-mapping", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const bodyMappingData = await c.req.json();
    await kv.set(`body-mapping:${user.id}`, bodyMappingData);
    return c.json({ success: true, data: bodyMappingData });
  } catch (error) {
    console.error('Update body mapping error:', error);
    return c.json({ error: 'Failed to update body mapping' }, 500);
  }
});

// ===== REPRODUCTIVE HEALTH ENDPOINT =====

app.get("/make-server-50d6a062/reproductive-health", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const reproductiveHealth = await kv.get(`reproductive-health:${user.id}`);
    return c.json({ data: reproductiveHealth || null });
  } catch (error) {
    console.error('Get reproductive health error:', error);
    return c.json({ error: 'Failed to fetch reproductive health' }, 500);
  }
});

app.put("/make-server-50d6a062/reproductive-health", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const reproductiveHealthData = await c.req.json();
    await kv.set(`reproductive-health:${user.id}`, reproductiveHealthData);
    return c.json({ success: true, data: reproductiveHealthData });
  } catch (error) {
    console.error('Update reproductive health error:', error);
    return c.json({ error: 'Failed to update reproductive health' }, 500);
  }
});

// ===== SEXUAL HEALTH ENDPOINT =====

app.get("/make-server-50d6a062/sexual-health", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const sexualHealth = await kv.get(`sexual-health:${user.id}`);
    return c.json({ data: sexualHealth || null });
  } catch (error) {
    console.error('Get sexual health error:', error);
    return c.json({ error: 'Failed to fetch sexual health' }, 500);
  }
});

app.put("/make-server-50d6a062/sexual-health", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const sexualHealthData = await c.req.json();
    await kv.set(`sexual-health:${user.id}`, sexualHealthData);
    return c.json({ success: true, data: sexualHealthData });
  } catch (error) {
    console.error('Update sexual health error:', error);
    return c.json({ error: 'Failed to update sexual health' }, 500);
  }
});

// ===== MEDICAL ADVOCACY ENDPOINT =====

app.get("/make-server-50d6a062/medical-advocacy", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const medicalAdvocacy = await kv.get(`medical-advocacy:${user.id}`);
    return c.json({ data: medicalAdvocacy || null });
  } catch (error) {
    console.error('Get medical advocacy error:', error);
    return c.json({ error: 'Failed to fetch medical advocacy' }, 500);
  }
});

app.put("/make-server-50d6a062/medical-advocacy", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const medicalAdvocacyData = await c.req.json();
    await kv.set(`medical-advocacy:${user.id}`, medicalAdvocacyData);
    return c.json({ success: true, data: medicalAdvocacyData });
  } catch (error) {
    console.error('Update medical advocacy error:', error);
    return c.json({ error: 'Failed to update medical advocacy' }, 500);
  }
});

// ===== ACCESSIBILITY ACCOMMODATIONS ENDPOINT =====

app.get("/make-server-50d6a062/accessibility", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const accessibility = await kv.get(`accessibility:${user.id}`);
    return c.json({ data: accessibility || null });
  } catch (error) {
    console.error('Get accessibility error:', error);
    return c.json({ error: 'Failed to fetch accessibility' }, 500);
  }
});

app.put("/make-server-50d6a062/accessibility", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return c.json({ error: 'Unauthorized' }, 401);

    const accessibilityData = await c.req.json();
    await kv.set(`accessibility:${user.id}`, accessibilityData);
    return c.json({ success: true, data: accessibilityData });
  } catch (error) {
    console.error('Update accessibility error:', error);
    return c.json({ error: 'Failed to update accessibility' }, 500);
  }
});

Deno.serve(app.fetch);
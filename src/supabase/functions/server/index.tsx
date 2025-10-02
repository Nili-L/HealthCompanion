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

Deno.serve(app.fetch);
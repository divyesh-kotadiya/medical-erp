import { connect, models, model } from 'mongoose';
import { ConfigService } from './config';
import { TenantSchema } from './modules/Tenants/schemas/tenant.schema';
import { UserSchema } from './modules/Users/schemas/user.schema';
import { ShiftSchema } from './modules/Shifts/schemas/shift.schema';
import { TimesheetSchema } from './modules/Timesheets/schemas/timesheet.schema';
import { IncidentSchema } from './modules/Incidents/schemas/incident.schema';
import { DocumentSchema } from './modules/Documents/schemas/document.schema';

async function seed() {
  try {
    const config = new ConfigService();
    const uri = config.getMongodbConfig().uri!;

    await connect(uri);
    console.log(`Connected to ${uri}`);

    const Tenant = models.Tenant || model('Tenant', TenantSchema);
    const User = models.User || model('User', UserSchema);
    const Shift = models.Shift || model('Shift', ShiftSchema);
    const Timesheet = models.Timesheet || model('Timesheet', TimesheetSchema);
    const Incident = models.Incident || model('Incident', IncidentSchema);
    const Doc = models.EDocument || model('EDocument', DocumentSchema);

    await Promise.all([
      Tenant.deleteMany({}),
      User.deleteMany({}),
      Shift.deleteMany({}),
      Timesheet.deleteMany({}),
      Incident.deleteMany({}),
      Doc.deleteMany({})
    ]);

    const t = await Tenant.create({ name: 'Demo Tenant', metadata: { demo: true } });
    const admin = await User.create({
      tenantId: t._id,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: 'changeme',
    });

    await Shift.create({
      tenantId: t._id,
      staffId: admin._id,
      start: new Date(),
      end: new Date(Date.now() + 3600 * 1000),
      location: { type: 'home' },
      notes: 'Demo shift',
    });

    await Timesheet.create({
      tenantId: t._id,
      staffId: admin._id,
      periodStart: new Date(),
      periodEnd: new Date(),
      hours: 1,
    });

    await Incident.create({
      tenantId: t._id,
      reportedBy: admin._id,
      title: 'Demo incident',
      description: 'none',
    });

    await Doc.create({
      tenantId: t._id,
      uploadedBy: admin._id,
      filename: 'demo.txt',
      url: 'https://example.com/demo.txt',
    });

    console.log('Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

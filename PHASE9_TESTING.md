# Phase 9: Coin System and Daily Missions - Testing and Validation

## Testing Strategy

### Phase 9.1: Core Wallet System Testing

#### Unit Tests
- **WalletManager Tests**
  - `testCreateWallet()`: Verify wallet creation with unique user ID
  - `testGetBalance()`: Verify balance retrieval for existing wallet
  - `testCreditCoins()`: Verify coin crediting with transaction recording
  - `testDebitCoins()`: Verify coin debiting with sufficient balance
  - `testDebitCoinsInsufficientBalance()`: Verify error handling for insufficient balance
  - `testAdjustBalance()`: Verify admin balance adjustments
  - `testUpdateWalletStatus()`: Verify wallet status changes

- **TransactionService Tests**
  - `testRecordTransaction()`: Verify transaction recording
  - `testGetTransactionHistory()`: Verify transaction history retrieval
  - `testGetTransactionsByReference()`: Verify reference-based transaction lookup

- **AuditLogger Tests**
  - `testLog()`: Verify audit log creation
  - `testGetAuditLogsForUser()`: Verify user audit log retrieval

- **PolicyService Tests**
  - `testGetPolicy()`: Verify policy retrieval by event type
  - `testUpsertPolicy()`: Verify policy creation and update
  - `testCalculateRewards()`: Verify reward calculation

#### Integration Tests
- **Wallet Operations Flow**
  - Test complete wallet creation → credit → debit → transaction history flow
  - Verify atomic operations and data consistency
  - Verify audit trail completeness

- **API Routes Tests**
  - `GET /api/wallet`: Verify balance retrieval
  - `POST /api/wallet`: Verify wallet creation
  - `GET /api/wallet/transactions`: Verify transaction history
  - `GET /api/wallet/balance`: Verify balance retrieval
  - `PUT /api/wallet/policies`: Verify policy management (admin only)

#### Concurrency Tests
- Test concurrent wallet operations to ensure data integrity
- Verify transaction isolation and locking mechanisms

#### Audit Verification Tests
- Verify all wallet operations create audit logs
- Verify audit log immutability
- Verify audit trail completeness for financial compliance

### Phase 9.2: Mission Engine Testing

#### Unit Tests
- **MissionEngine Tests**
  - `testGetAvailableMissions()`: Verify available mission retrieval
  - `testGetUserMissions()`: Verify user mission retrieval
  - `testAssignMission()`: Verify mission assignment
  - `testUpdateMissionProgress()`: Verify progress updates
  - `testCompleteMission()`: Verify mission completion and reward distribution

- **ProgressTracker Tests**
  - `testCheckCompletion()`: Verify completion detection for all mission types
  - `testCalculateProgressPercentage()`: Verify progress calculation
  - `testValidateProgressUpdate()`: Verify progress validation

- **RewardDistributor Tests**
  - `testDistributeRewards()`: Verify reward distribution
  - `testCalculateRewards()`: Verify reward calculation from policies
  - `testAwardEventRewards()`: Verify event-based reward awarding

- **CriteriaValidator Tests**
  - `testValidateMissionDefinition()`: Verify mission definition validation
  - `testValidateCriteriaForMissionType()`: Verify criteria validation per mission type
  - `testValidateRewards()`: Verify reward value validation

- **MissionScheduler Tests**
  - `testScheduleMission()`: Verify mission scheduling
  - `testActivateMission()`: Verify mission activation
  - `testDeactivateMission()`: Verify mission deactivation
  - `testPerformDailyReset()`: Verify daily reset logic

#### Integration Tests
- **Mission Lifecycle Flow**
  - Test complete mission lifecycle: schedule → assign → progress → complete → reward
  - Verify daily reset functionality
  - Verify mission expiration handling

- **Mission Type Specific Tests**
  - Daily Login Mission: Verify completion on first login
  - Lesson Completion Mission: Verify completion after target lessons
  - Quiz Completion Mission: Verify completion with score requirements
  - Vocabulary Mission: Verify completion after target sessions
  - Streak Mission: Verify completion after target streak days

#### Edge Function Tests
- Test daily reset Edge Function execution
- Verify cron job scheduling
- Verify authentication and authorization

### Phase 9.3: Admin Interfaces Testing

#### UI Component Tests
- **WalletManagement Component**
  - Verify user search functionality
  - Verify balance adjustment controls
  - Verify wallet status controls
  - Verify bulk operations

- **MissionManagement Component**
  - Verify mission creation
  - Verify mission scheduling
  - Verify mission activation/deactivation
  - Verify reset policy configuration

- **Analytics Components**
  - Verify data display accuracy
  - Verify chart rendering
  - Verify real-time updates

#### Admin API Tests
- Verify admin-only endpoints require authentication
- Verify admin role-based access control
- Verify audit logging for admin operations

## Validation Checklist

### Database Schema Validation
- [ ] All tables created with correct columns and types
- [ ] Foreign key constraints properly defined
- [ ] Indexes created for performance
- [ ] Relations defined in Drizzle schema
- [ ] Migration files successfully applied

### Wallet System Validation
- [ ] Wallet creation works for new users
- [ ] Balance retrieval returns correct values
- [ ] Coin crediting updates balance and creates transaction
- [ ] Coin debiting checks balance and updates correctly
- [ ] Transaction history shows complete record
- [ ] Audit logs capture all operations
- [ ] Coin economy policies are seeded correctly

### Mission System Validation
- [ ] Mission definitions can be created and retrieved
- [ ] Mission scheduling works correctly
- [ ] Mission assignment to users works
- [ ] Progress updates are tracked correctly
- [ ] Mission completion triggers reward distribution
- [ ] Daily reset clears progress for daily missions
- [ ] Mission history records completions

### Integration Validation
- [ ] Lesson completion triggers coin rewards
- [ ] Quiz completion triggers coin rewards
- [ ] Daily login triggers coin rewards
- [ ] Vocabulary session triggers coin rewards
- [ ] Streak milestones trigger bonus rewards
- [ ] Achievement unlock triggers rewards
- [ ] Daily challenge completion triggers rewards

### Security Validation
- [ ] API routes require authentication
- [ ] Admin endpoints require admin role
- [ ] Audit logs track all operations
- [ ] Wallet operations are atomic
- [ ] No SQL injection vulnerabilities
- [ ] Rate limiting implemented where appropriate

### Performance Validation
- [ ] Wallet operations complete within acceptable time (< 100ms)
- [ ] Mission operations complete within acceptable time (< 200ms)
- [ ] Database queries use indexes efficiently
- [ ] API responses are cached appropriately
- [ ] Edge Function executes within timeout limits

## Manual Testing Steps

### 1. Database Migration
```bash
# Apply wallet system migration
npm run db:push

# Apply mission system migration
npm run db:push

# Seed coin economy policies
npm run db:seed
```

### 2. Wallet System Testing
1. Create a test user
2. Navigate to wallet dashboard
3. Verify wallet is automatically created
4. Test coin crediting via API
5. Test coin debiting via API
6. Verify transaction history updates
7. Verify audit logs are created

### 3. Mission System Testing
1. Create test missions via admin interface
2. Schedule missions for today
3. Assign missions to test users
4. Update mission progress
5. Complete missions
6. Verify rewards are distributed
7. Trigger daily reset Edge Function
8. Verify progress is reset

### 4. Integration Testing
1. Complete a lesson
2. Verify coin rewards are awarded
3. Complete a quiz
4. Verify coin rewards are awarded
5. Login for the first time in a day
6. Verify daily login reward
7. Reach a streak milestone
8. Verify bonus rewards

### 5. Admin Interface Testing
1. Access admin dashboard
2. Verify wallet management controls
3. Verify mission management controls
4. Verify analytics dashboards display data
5. Test policy management

## Exit Criteria

Phase 9 is considered complete when:

1. **All database migrations applied successfully**
2. **All unit tests pass** (target: 90%+ coverage)
3. **All integration tests pass**
4. **Manual testing validates all user flows**
5. **Security audit passes** (no critical vulnerabilities)
6. **Performance benchmarks met** (all operations within acceptable time limits)
7. **Admin interfaces functional** for wallet and mission management
8. **Analytics dashboards display accurate data**
9. **Integration with existing phases works correctly**
10. **Documentation complete** (API docs, component docs, deployment guide)

## Deployment Checklist

- [ ] Environment variables configured (Supabase URL, keys, cron secret)
- [ ] Database migrations applied to production
- [ ] Coin economy policies seeded in production
- [ ] Edge Functions deployed to Supabase
- [ ] Cron jobs configured for daily reset
- [ ] API routes tested in production environment
- [ ] Monitoring and logging configured
- [ ] Rollback plan documented

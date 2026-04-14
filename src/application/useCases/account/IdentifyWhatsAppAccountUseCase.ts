import { Account } from '@application/entities/Account';
import { AccountRepository } from '@infrastructure/database/dynamo/repositories/AccountRepository';

import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class IdentifyWhatsAppAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) { }

  async execute(phone: string): Promise<Account> {
    const existing = await this.accountRepository.findByPhone(phone);

    if (existing) {
      return existing;
    }

    const account = new Account({ phone });

    await this.accountRepository.create(account);

    return account;
  }
}

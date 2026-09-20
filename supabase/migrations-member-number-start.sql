-- Member numbers: start at 1001 and display without leading zeros.
--
-- Run ONCE, and only BEFORE real members exist. `restart` does not
-- renumber anyone already issued, so running it later creates a gap and,
-- if the sequence has already passed 1001, a collision against the unique
-- index on profiles.member_number.
--
-- Padding drops 6 -> 4 so the first member reads 1001 rather than 001001.
-- lpad only pads, never truncates, so the number grows past 9999 on its own.

-- Safety check: refuses to run if any non-seed member already has a number.
do $$
declare n int;
begin
  select count(*) into n from profiles where member_number is not null;
  if n > 0 then
    raise notice 'WARNING: % profiles already have member numbers. Review before running.', n;
  end if;
end $$;

alter sequence member_number_seq restart with 1001;

create or replace function assign_member_number()
returns trigger as $$
begin
  if new.member_number is null then
    new.member_number := 'MPC-' || lpad(nextval('member_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

-- Verify: should report 1001.
select last_value from member_number_seq;

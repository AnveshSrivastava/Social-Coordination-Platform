package com.app.localgroup.group;

import com.app.localgroup.group.model.Group;
import com.app.localgroup.group.model.GroupMember;
import com.app.localgroup.group.repository.GroupMemberRepository;
import com.app.localgroup.group.repository.GroupRepository;
import com.app.localgroup.user.model.User;
import com.app.localgroup.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GroupLifecycleScheduler {

    private static final Logger log = LoggerFactory.getLogger(GroupLifecycleScheduler.class);

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Value("${app.group.confirmation-window-hours:24}")
    private long confirmationWindowHours;

    @Value("${app.group.expire-buffer-minutes:30}")
    private long expireBufferMinutes;

    // Runs every minute to progress group states
    @Scheduled(fixedDelayString = "PT1M")
    public void run() {
        Instant now = Instant.now();

        // JOINABLE -> CONFIRMATION
        groupRepository.findAll().stream().filter(g -> g.getStatus() == Group.Status.JOINABLE)
                .filter(g -> g.getDateTime().minusSeconds(confirmationWindowHours * 3600).isBefore(now) || g.getDateTime().isBefore(now))
                .forEach(g -> {
                    g.setStatus(Group.Status.CONFIRMATION);
                    groupRepository.save(g);
                    log.info("Group {} transitioned JOINABLE->CONFIRMATION", g.getId());
                });

        // CONFIRMATION -> ACTIVE (at event time)
        groupRepository.findAll().stream().filter(g -> g.getStatus() == Group.Status.CONFIRMATION)
                .filter(g -> !g.getDateTime().isAfter(now))
                .forEach(g -> {
                    List<GroupMember> members = groupMemberRepository.findByGroupId(g.getId());
                    // remove unconfirmed -> apply no-show penalty
                    members.stream().filter(m -> !m.isConfirmed()).forEach(m -> {
                        userRepository.findById(m.getUserId()).ifPresent(u -> {
                            u.setTrustScore(u.getTrustScore() - 2); // penalty for no-show
                            userRepository.save(u);
                        });
                        groupMemberRepository.delete(m);
                    });
                    long confirmed = groupMemberRepository.findByGroupId(g.getId()).stream().filter(GroupMember::isConfirmed).count();
                    if (confirmed >= 2) {
                        g.setStatus(Group.Status.ACTIVE);
                        groupRepository.save(g);
                        log.info("Group {} transitioned CONFIRMATION->ACTIVE", g.getId());
                    } else {
                        g.setStatus(Group.Status.EXPIRED);
                        groupRepository.save(g);
                        log.info("Group {} expired due to insufficient confirmed members", g.getId());
                    }
                });

        // ACTIVE -> EXPIRED after event time + buffer
        groupRepository.findAll().stream().filter(g -> g.getStatus() == Group.Status.ACTIVE)
                .filter(g -> g.getDateTime().plusSeconds(expireBufferMinutes * 60).isBefore(now))
                .forEach(g -> {
                    // award +1 for confirmed attendance
                    groupMemberRepository.findByGroupId(g.getId()).stream().filter(GroupMember::isConfirmed).forEach(m -> {
                        userRepository.findById(m.getUserId()).ifPresent(u -> {
                            u.setTrustScore(u.getTrustScore() + 1);
                            userRepository.save(u);
                        });
                    });

                    g.setStatus(Group.Status.EXPIRED);
                    groupRepository.save(g);
                    log.info("Group {} transitioned ACTIVE->EXPIRED", g.getId());
                });
    }
}

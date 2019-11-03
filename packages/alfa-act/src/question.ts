import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Monad } from "@siteimprove/alfa-monad";

export class Question<Q, A, T = A> implements Monad<T>, Functor<T> {
  public static of<Q, A>(uri: string, type: Q): Question<Q, A> {
    return new Question(uri, type, answer => answer);
  }

  public readonly uri: string;
  public readonly type: Q;
  private readonly quester: Mapper<A, T>;

  protected constructor(uri: string, type: Q, quester: Mapper<A, T>) {
    this.uri = uri;
    this.type = type;
    this.quester = quester;
  }

  public map<U>(mapper: Mapper<T, U>): Question<Q, A, U> {
    return new Question(this.uri, this.type, answer =>
      mapper(this.quester(answer))
    );
  }

  public flatMap<U>(mapper: Mapper<T, Question<Q, A, U>>): Question<Q, A, U> {
    return new Question(this.uri, this.type, answer =>
      mapper(this.quester(answer)).quester(answer)
    );
  }

  public answer(answer: A): T {
    return this.quester(answer);
  }

  public toJSON() {
    return {
      uri: this.uri,
      type: this.type
    };
  }
}
